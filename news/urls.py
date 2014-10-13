from django.conf.urls import patterns, url

from news import views

urlpatterns = patterns('',
    url(r'^slide-templates/all$', views.all_slide_templates, name='all_templates'),

    # Event URLs
    url(r'^event/add$', views.add_event, name='add_event'),
    url(r'^event/all$', views.all_events, name='all_events'),
    url(r'^event/(?P<event_id>\d+)/$', views.edit_event, name='edit_event'),
    url(r'^event/currents$', views.current_events, name='current_events'),

    # Alert URLs
    url(r'^alert/currents$', views.current_alerts, name='current_alerts'),

    # Content URLs
    url(r'^content/(?P<content_id>\d+)/$', views.get_content, name='edit_content'),
    url(r'^content/(?P<content_id>\d+)/edit$', views.edit_content, name='edit_content'),
    url(r'^content/add$', views.add_content, name='add_content'),
    url(r'^content/all$', views.all_contents, name='all_content'),
    url(r'^content/currents$', views.current_slides, name='current_slides'),

    url(r'^search/$', views.search_content, name='search_content'),
    url(r'^search/json', views.search_content_query_json, name='search_content_query_json'),

    # Display URLs
    url(r'^display/$', views.news_display, name='news_display'),

    # Index
    url(r'^$', views.index, name='index')
)

