// Settings
var BaseURL = '/news/';
var SearchURL = BaseURL + 'search/json';

// Search system interface.
function Searcher() {
    this.contents = [];

    // Performs the actual search
    this.search = function() {
        var self = this;
        var query = {
            category: $( "#search-category" ).val(),
            term: $( "#search-term" ).val(),
        };

        $.get(SearchURL, query, function(result) {
            self.updateResult(result);
        })
    }

    // Updates the search result.
    this.updateResult = function(result) {
        this.removeOldResults();
        this.contents = readContentArray(result);

        var table = $( '#search-results' );
        if(this.contents.length == 0) {
            table.append($('<tr><td>La busqueda no arroja resultados</td></tr>'));
        }
        else {
            for(var i = 0; i < this.contents.length; ++i) {
                table.append(this.makeContentRow(this.contents[i]));
            }
        }
    }

    // Makes the row for a content.
    this.makeContentRow = function(content) {
        var title_link = $('<a></a>').attr('href', content.editUrl()).html(content.title)
        var title = $('<td class="search-result-title"></td>').append(title_link);

        var type = $('<td class="search-result-type"></td>').html(content.contentType());
        var author = $('<td class="search-result-author"></td>').html(content.author);
        var circulation_start = $('<td class="search-result-circulation-start"></td>').html(content.circulationStart());
        var circulation_end = $('<td class="search-result-circulation-end"></td>').html(content.circulationEnd());

        var published = $('<td class="search-result-circulation-end">Publicado</td>');
        var published_box = $('<input type="checkbox" >').prop("checked", content.published);

        published.prepend(published_box);

        return $('<tr></tr>')
                    .append(title)
                    .append(type)
                    .append(author)
                    .append(circulation_start)
                    .append(circulation_end)
                    .append(published);
    }

    // Removes the old results.
    this.removeOldResults = function() {
        $('#search-results > tbody').empty();
    }

    // Called when the search category has changed.
    this.categoryChanged = function () {
        this.search();
    }

    // Called when the search term has changed.
    this.termChanged = function () {
        this.search();
    }
}

// Searcher interface object.
var searcher = new Searcher();

$(document).ready(function() {searcher.search();})

