from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'^sentiment/', include('sentiment.urls', namespace='sentiment')),
    url(r'^markit/', include('markit.urls', namespace='markit')),
    url(r'^quandl/', include('quandl.urls', namespace='quandl')),
    url(r'^twitter/', include('twitter.urls', namespace='twitter')),
    url(r'^article_feeds/', include('article_feeds.urls', namespace='article_feeds')),
    url(r'^users/', include('users.urls', namespace='users')),
    url(r'^$', include('pages.urls', namespace='pages')),  
    url(r'^admin/', include(admin.site.urls)), 
]
