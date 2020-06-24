
if (window.location.protocol.startsWith('http')) {
    // http or https - use API of current Annif instance
    var base_url = '/v1/'; 
} else {
    // local development case - use Finto AI dev API
    var base_url = 'https://ai.dev.finto.fi/v1/';
}

function clearResults() {
    $('#results').empty();
    $('#suggestions').hide();
}

function fetchProjects() {
    $.ajax({
        url: base_url + "projects",
        method: 'GET',
        success: function(data) {
            $('#project').empty();
            $.each(data.projects, function(idx, value) {
                $('#project').append(
                    $('<option>').attr('value',value.project_id).append(value.name)
                );
            });
        }
    });
}

function getSuggestions() {
    $('#suggestions').show();
    $('#results-spinner').show();
    $.ajax({
        url: base_url + "projects/" + $('#project').val() + "/suggest",
        method: 'POST',
        data: {
          text: $('#text').val(),
          limit: $('input[name="limit"]:checked').val(),
          threshold: 0.01
        },
        success: function(data) {
            $('#results-spinner').hide();

            if (data.results.length == 0) {
                $('#results').hide();
                $('#no-results').show();
            }
            $.each(data.results, function(idx, value) {
                $('#no-results').hide();
                $('#results').append(
                    $('<li class="list-group-item p-0">').append(
                        $('<meter class="mr-2">').attr('value',value.score).attr('max',1.0).attr('title',value.score.toFixed(4)),
                        $('<a target="_blank">').attr('href',value.uri).append(value.label)
                    )
                );
                $('#results').show();
            });
        }
    });
}

function disableButton() {
    $('#get-suggestions').prop("disabled", true);
}

function enableButton() {
    $('#get-suggestions').prop("disabled", false);
}

$(document).ready(function() {
    $('#no-results').hide();
    $('#results-spinner').hide();
    clearResults();
    if ($.trim($('#text').val()) != "") {
        enableButton();
    } else {
        disableButton();
    }
    fetchProjects();
    $('#get-suggestions').click(function() {
        clearResults();
        getSuggestions();
    });
    $('#button-clear').click(function() {
        $('#text').val('');
        $('#text').focus();
        clearResults();
        disableButton();
    });
    $('#text').on("input", function() {
        enableButton();
    });
});