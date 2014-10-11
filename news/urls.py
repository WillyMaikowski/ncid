from django.conf.urls import patterns, url

from news import views

urlpatterns = patterns('',
    url(r'^slide-templates/all$', views.all_slide_templates, name='all_templates'),

    # Event URLs
    url(r'^event/add$', views.add_event, name='add_event'),
    url(r'^event/(?P<event_id>\d+)/$', views.edit_event, name='edit_event'),
    url(r'^event/currents$', views.current_events, name='current_events'),

    # Alert URLs
    url(r'^alert/currents$', views.current_alerts, name='current_alerts'),

    # Content URLs
    url(r'^content/add$', views.add_content, name='add_content'),
    url(r'^content/search/$', views.search_content, name='search_content'),
    url(r'^content/currents$', views.current_slides, name='current_slides'),

    # Display URLs
    url(r'^display/$', views.news_display, name='news_display'),

    # Index
    url(r'^$', views.index, name='index')
)

