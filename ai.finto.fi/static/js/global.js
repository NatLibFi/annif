var set_locale_to = function(locale) {

    if (locale) {

        $.i18n().locale = locale;

    }

    $('body').i18n();

};

jQuery(function() {

    $.i18n().load({

        'en': {
            "nav-about": "About",
            "nav-feedback": "Feedback",
            "read-more": "Read more",
            "splash": "Finto AI suggests subjects for a given text. It's based on Annif, a tool for automated subject indexing.",
            "api-title": "API service",
            "api-desc": "Finto AI is also an API service that can be integrated to other systems.",
            "text-box-label-text": "Enter text to be indexed",
            "nav-subject-indexing": "Subject indexing",
            "project": "Vocabulary and text language",
            "limit": "Number of suggestions",
            "get-suggestions": "Get subject suggestions",
            "suggestions": "Suggestions",
            "footer-text": "The data submitted via the above form or the API will not be saved anywhere. Usage of the service is being monitored for development purposes.",
            "footer-link": "See our privacy policy"
        },
        'sv': {
            "nav-about": "Information",
            "nav-feedback": "Respons",
            "read-more": "Läs mer",
            "splash": "Finto AI föreslår ämnesord för text. Det är baserat på Annif, ett verktyg för automatisk indexering.",
            "api-title": "API-tjänst",
            "api-desc": "Finto AI är också en API-tjänst som kan integreras med andra system.",
            "text-box-label-text": "Text för indexering",
            "nav-subject-indexing": "Ämnesordsindexering",
            "project": "Volabulär och textens språk",
            "limit": "Antal förslag",
            "get-suggestions": "Ge förslag till ämnesord",
            "suggestions": "Förslag",
            "footer-text": "Uppgifterna som skickas via formuläret eller API-tjänsten sparas inte. Användningen av tjänsten övervakas för utvecklingsändamål.",
            "footer-link": "Läs vår sekretesspolicy"
        },

        'fi': {
            "nav-about": "Tietoja",
            "nav-feedback": "Palaute",
            "read-more": "Lue lisää",
            "splash": "Finto AI ehdottaa tekstille sopivia aiheita. Palvelu perustuu Annif-työkaluun.",
            "api-title": "API-palvelu",
            "api-desc": "Finto AI toimii myös rajapintapalveluna, joka voidaan integroida omiin järjestelmiin",
            "text-box-label-text": "Kuvailtava teksti",
            "nav-subject-indexing": "Sisällonkuvailu",
            "project": "Sanasto ja tekstin kieli",
            "limit": "Ehdotusten määrä",
            "get-suggestions": "Anna aihe-ehdotukset",
            "suggestions": "Ehdotetut aiheet",
            "footer-text": "Lomakkeen ja rajapintapalveluiden kautta lähettyjä tietoja ei talleteta.  Palvelun käyttöä seurataan ja tilastoidaan palvelun kehittämiseksi.",
            "footer-link": "Lue tietosuojaseloste"
        }


    }).done(function() {

        set_locale_to(url('?locale'));

        History.Adapter.bind(window, 'statechange', function() {

            set_locale_to(url('?locale'));

        });

        $('#switch-locale').on('click', 'a', function(e) {

            e.preventDefault();

            History.pushState(null, null, "?locale=" + $(this).data('locale'));

        });

    });

});



/* TODO: Make the missing links and make them work  */