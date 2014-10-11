// The application base URL.
var BaseURL = '/news/';
var CurrentAlertsURL = BaseURL + 'alert/currents';
var AlertRefreshTime = 5000;

// Setup some things when the DOM is ready.
$(document).ready(function() {
    // Setup some widgets.
    $( "#leftPanelAccordion" ).accordion({
        heightStyle: "fill"
    });
    
    $( "#leftPanel" ).resizable({
        resize: function() {
            $( "#leftPanelAccordion" ).accordion( "refresh" );
        }
    });
});

// Update the current alerts.
function refreshAlerts()
{
    //console.log('refreshAlerts');
}

// Setup some periodic functions.
$(window).load(function() {
    // Update alerts
    window.setInterval(refreshAlerts, AlertRefreshTime);
});
