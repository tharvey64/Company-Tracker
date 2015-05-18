from django.shortcuts import render
from django.views.generic.base import View

# Create your views here.
class IndexView(View):
    template = 'pages/index.html'

    def get(self, request):
        return render(request, self.template)