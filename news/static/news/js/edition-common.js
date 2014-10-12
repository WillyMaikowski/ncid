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

