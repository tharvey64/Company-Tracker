from django.conf.urls import include, url,patterns
import quandl.views as view

urlpatterns = patterns('',
        url(r'^$', view.IndexView.as_view(), name='index'),
        url(r'^stock_history/(?P<symbol>[a-zA-Z]+)/$', view.StockHistory.as_view(), name='history'),
)