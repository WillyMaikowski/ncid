from django.conf.urls import patterns, url

from news import views

urlpatterns = patterns('',
    url(r'^slide-templates/all$', views.all_slide_templates, name='all_templates'),
    url(r'^event/add$', views.add_event, name='add_event'),
    url(r'^event/currents$', views.current_events, name='current_events'),
    url(r'^alert/currents$', views.current_alerts, name='current_alerts'),
    url(r'^content/add$', views.add_content, name='add_content'),
    url(r'^content/search/$', views.search_content, name='search_content'),
    url(r'^content/currents$', views.current_slides, name='current_slides'),
    url(r'^display/$', views.news_display, name='news_display'),
    url(r'^$', views.index, name='index')
)

