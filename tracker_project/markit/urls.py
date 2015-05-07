from django.conf.urls import include, url,patterns
import markit.views as view

urlpatterns = patterns('',
        url(r'^$', view.IndexView.as_view(), name='index'),
        url(r'^quote/(?P<symbol>[a-zA-Z]+)/$', view.LiveStock.as_view(), name='live'),
        url(r'^search/(?P<input_string>+)/$', view.LiveStock.as_view(), name='search'),
)