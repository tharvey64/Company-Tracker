from django.conf.urls import include, url,patterns
import markit.views as view

urlpatterns = patterns('',
        url(r'^$', view.IndexView.as_view(), name='index'),
        url(r'^live_stock/$', view.LiveStock.as_view(), name='live'),
)