from django.conf.urls import include, url,patterns
import quandl.views as view

urlpatterns = patterns('',
        url(r'^$', view.IndexView.as_view(), name='index'),
        url(r'^stock_history/(?P<symbol>[a-zA-Z]+)/(?P<date_string>[a-zA-Z0-9-]+)$', view.StockHistoryView.as_view(), name='history'),
        url(r'^company/(?P<symbol>[a-zA-Z]+)/$', view.CompanyView.as_view(), name='view'),
        url(r'^add_company/(?P<symbol>[a-zA-Z]+)?$', view.CreateCompanyView.as_view(), name='create'),
)