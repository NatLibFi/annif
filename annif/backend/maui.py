"""Maui backend that makes calls to a Maui Server instance using its API"""


import time
import os.path
import json
import requests
import requests.exceptions
from annif.exception import ConfigurationException
from annif.exception import NotSupportedException
from annif.exception import OperationFailedException
from annif.suggestion import SubjectSuggestion, ListSuggestionResult
from . import backend


class MauiBackend(backend.AnnifBackend):
    name = "maui"

    TRAIN_FILE = 'maui-train.jsonl'

    def endpoint(self, params):
        try:
            return params['endpoint']
        except KeyError:
            raise ConfigurationException(
                "endpoint must be set in project configuration",
                backend_id=self.backend_id)

    def tagger(self, params):
        try:
            return params['tagger']
        except KeyError:
            raise ConfigurationException(
                "tagger must be set in project configuration",
                backend_id=self.backend_id)

    def tagger_url(self, params):
        return self.endpoint(params) + self.tagger(params)

    def _initialize_tagger(self, params):
        self.info(
            "Initializing Maui Service tagger '{}'".format(
                self.tagger(params)))

        # try to delete the tagger in case it already exists
        resp = requests.delete(self.tagger_url(params))
        self.debug("Trying to delete tagger {} returned status code {}"
                   .format(self.tagger(params), resp.status_code))

        # create a new tagger
        data = {'id': self.tagger(params), 'lang': params['language']}
        try:
            resp = requests.post(self.endpoint(params), data=data)
            self.debug("Trying to create tagger {} returned status code {}"
                       .format(self.tagger(params), resp.status_code))
            resp.raise_for_status()
        except requests.exceptions.RequestException as err:
            raise OperationFailedException(err)

    def _upload_vocabulary(self, params):
        self.info("Uploading vocabulary")
        try:
            resp = requests.put(self.tagger_url(params) + '/vocab',
                                data=self.project.vocab.as_skos())
            resp.raise_for_status()
        except requests.exceptions.RequestException as err:
            raise OperationFailedException(err)

    def _create_train_file(self, corpus):
        self.info("Creating train file")
        train_path = os.path.join(self.datadir, self.TRAIN_FILE)
        with open(train_path, 'w') as train_file:
            for doc in corpus.documents:
                doc_obj = {'content': doc.text, 'topics': list(doc.labels)}
                json_doc = json.dumps(doc_obj)
                print(json_doc, file=train_file)

    def _upload_train_file(self, params):
        self.info("Uploading training documents")
        train_path = os.path.join(self.datadir, self.TRAIN_FILE)
        with open(train_path, 'rb') as train_file:
            try:
                resp = requests.post(self.tagger_url(params) + '/train',
                                     data=train_file)
                resp.raise_for_status()
            except requests.exceptions.RequestException as err:
                raise OperationFailedException(err)

    def _wait_for_train(self, params):
        self.info("Waiting for training to be completed...")
        while True:
            try:
                resp = requests.get(self.tagger_url(params) + "/train")
                resp.raise_for_status()
            except requests.exceptions.RequestException as err:
                raise OperationFailedException(err)

            response = resp.json()
            if response['completed']:
                self.info("Training completed.")
                return
            time.sleep(1)

    def _train(self, corpus, params):
        if corpus == 'cached':
            raise NotSupportedException(
                'Training maui project from cached data not supported.')
        if corpus.is_empty():
            raise NotSupportedException('training backend {} with no documents'
                                        .format(self.backend_id))
        self._initialize_tagger(params)
        self._upload_vocabulary(params)
        self._create_train_file(corpus)
        self._upload_train_file(params)
        self._wait_for_train(params)

    def _suggest_request(self, text, params):
        data = {'text': text}
        headers = {"Content-Type":
                   "application/x-www-form-urlencoded; charset=UTF-8"}

        try:
            resp = requests.post(self.tagger_url(params) + '/suggest',
                                 data=data,
                                 headers=headers)
            resp.raise_for_status()
        except requests.exceptions.RequestException as err:
            self.warning("HTTP request failed: {}".format(err))
            return None

        try:
            return resp.json()
        except ValueError as err:
            self.warning("JSON decode failed: {}".format(err))
            return None

    def _response_to_result(self, response):
        subject_suggestions = []
        try:
            for hit in response['topics']:
                if hit['probability'] > 0.0:
                    subject = self.project.subjects[
                        self.project.subjects.by_uri(hit['id'])]
                    subject_suggestions.append(
                        SubjectSuggestion(uri=subject[0],
                                          label=subject[1],
                                          notation=subject[2],
                                          score=hit['probability']))
        except (TypeError, ValueError) as err:
            self.warning("Problem interpreting JSON data: {}".format(err))
            return ListSuggestionResult([], self.project.subjects)
        return ListSuggestionResult(subject_suggestions, self.project.subjects)

    def _suggest(self, text, params):
        response = self._suggest_request(text, params)
        if response:
            return self._response_to_result(response)
        else:
            return ListSuggestionResult([], self.project.subjects)
