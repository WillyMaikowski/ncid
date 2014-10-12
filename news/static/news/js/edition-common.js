// The application base URL.
var BaseURL = '/news/';

// Setup some things when the DOM is ready.
$(document).ready(function() {
    // Setup some widgets.
    $( "#leftPanelAccordion" ).accordion({
        heightStyle: "fill"
    });
    
    $( ".dateInput" ).each(function() {
        $(this).datepicker({
            dateFormat: 'dd-mm-yy',
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

