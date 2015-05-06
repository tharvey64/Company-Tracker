from django.conf.urls import include, url
from django.contrib import admin
import article_feeds.views as view

urlpatterns = [
    url(r'^yahoo/(?P<symbol>[a-zA-Z]+)/$', view.YahooArticleListView.as_view(), name ='search'),   
]