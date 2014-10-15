// The application base URL.
var BaseURL = '/news/';
var DraftURL = BaseURL + 'content/draft';

// Setup some things when the DOM is ready.
$(document).ready(function() {
    // Setup some widgets.
    $( ".dateInput" ).each(function() {
        $(this).attr("data-date-format", "DD/MM/YYYY")
                .datetimepicker({
                pickTime: false
        });
    });

    $( ".dateTimeInput" ).each(function() {
        $(this).attr("data-date-format", "DD/MM/YYYY HH:mm")
                .datetimepicker();
    });

    $( ".timeInput" ).each(function() {
        $(this).attr("data-date-format", "HH:mm")
                .datetimepicker({
                pickDate: false
        });
    });

});

// Cross site request forgery protection for Django. https://docs.djangoproject.com/en/dev/ref/contrib/csrf/
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

// Helper functions for converting the dates.
function numberFormatForTime(number) {
    if(number < 10)
        return '0' + number;
    return number;
}

function formatTime(datetime) {
    return numberFormatForTime(datetime.getHours()) + ':' + numberFormatForTime(datetime.getMinutes());
}

// Formats a date for the current localization.
function localFormatDate(date) {
    // Hack: Use something more proper
    return numberFormatForTime(date.getDay()) + '/' + numberFormatForTime(date.getMonth()) + '/' + numberFormatForTime(date.getFullYear());
}

function localFormatDateTime(datetime) {
    return localFormatDate(datetime) + " " + formatTime(datetime);
}


// Draft bar
function DraftBar() {
    var RefreshInterval = 1000;
    var self = this;

    // Loads the data into the draft bar.
    this.loadData = function(data) {
        var contents = readContentArray(data);
        var draftsBlock = $("#draftsBlock").empty();
        
        for(var i = 0; i < contents.length; ++i)
            this.addContentToBlock(contents[i], draftsBlock);
    }

    // Adds a content into a draft block.
    this.addContentToBlock = function(content, block) {
        var element = $( "<a></a>" );
        element.attr("href", content.editUrl());
        element.html(content.title);
        block.append($( "<tr></tr>").append( $("<td></td>").append(element)) );
    }

    // Reloads the drafts.
    this.load = function() {
        $.getJSON(DraftURL, function(data) {
            self.loadData(data);
        }); 
    }

    // Load when the document is ready.
    $(document).ready(function() {
        SlideTemplates.load(function() {
            self.load();
        });
    })
}

var draftBar = new DraftBar()
