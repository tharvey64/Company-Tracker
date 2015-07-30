from django.conf.urls import include, url,patterns
import sentiment.views as view

urlpatterns = patterns('',
        url(r'^text/$', view.TextSentimentView.as_view(), name='text'),
)