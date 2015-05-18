from django.shortcuts import render

# Create your views here.
class IndexView(View):
    template = 'pages/index.html'

    def get(self, request):
        return render(request, self.template)