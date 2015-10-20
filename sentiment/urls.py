from django.conf.urls import include, url, patterns
import sentiment.views as view

urlpatterns = patterns('',
        url(r'^yahoo/(?P<symbol>[a-zA-Z]+)/$', view.YahooArticleListView.as_view(), name='search'),
        url(r'^article_sentiment/$', view.ArticleSentiment.as_view(), name='sentiment'), 
        url(r'^text/$', view.TextSentimentView.as_view(), name='text'),
        url(r'^search/random$', view.SearchView.as_view(), name ='postsearch'),
        url(r'^search/lists$', view.SearchListView.as_view(), name ='listsearch'),
        url(r'^oauth/$', view.AppView.as_view(), name='oauth'),
        url(r'^callback/$', view.CallbackView.as_view(), name ='index')
)