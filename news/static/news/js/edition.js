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

    $( ".dateInput" ).datepicker({
        dateFormat: 'dd-mm-yy',
        
    });
});

// Update the current alerts.
function refreshAlerts()
{
    $.getJSON(CurrentAlertsURL, function(alerts) {
        // Get the alerts block
        var alertsBlock = $("#alertsBlock");
        alertsBlock.empty();

        // Display a no alerts message if there is none.
        if(alerts.length == 0)
        {
            alertsBlock.html("No hay alertas");
            return;
        }

        // Create the alerts table.
        var alertsTable = $('<table></table>');
        alertsBlock.append(alertsTable);

        // Read the alerts.
        for(var i = 0; i < alerts.length; ++i) {
            var alert = alerts[i];
            var id = alert.pk;
            var fields = alert.fields;

            // Add the row.
            var row = $('<tr><td>' + fields.message + '</td></tr>');
            alertsTable.append(row);
        }
    });
}

// Setup some periodic functions.
$(window).load(function() {
    // Update alerts
    refreshAlerts();
    window.setInterval(refreshAlerts, AlertRefreshTime);
});
