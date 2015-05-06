from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'^markit/', include('markit.urls', namespace='markit')),
    url(r'^quandl/', include('quandl.urls', namespace='quandl')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^stockgraph/', include('stockgraph.urls')),
    url(r'^twitter/', include('twitter.urls')),
    url(r'^article_feeds/', include('article_feeds.urls', namespace='article_feeds')),    
]
