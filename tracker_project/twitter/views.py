from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import JsonResponse
from twython import Twython
from pprint import pprint
from collections import Counter
from alchemyapi import AlchemyAPI
import tracker_project.settings.TWITTER_KEY as APP_KEY
import tracker_project.settings.TWITTER_SECRET as APP_SECRET

# Create your views here.
# class IndexView(View):
#     twitter = Twython(APP_KEY, APP_SECRET)
#     auth = twitter.get_authentication_tokens(callback_url='http://127.0.0.1:8000/twitter/callback')

#     def get(self, request):
#         request.session['OAUTH_TOKEN'] = self.auth['oauth_token']
#         request.session['OAUTH_TOKEN_SECRET'] = self.auth['oauth_token_secret']
#         return redirect(self.auth['auth_url'])

# class CallbackView(View):

#     def get(self, request):
#         oauth_verifier = request.GET['oauth_verifier']
#         twitter = Twython(APP_KEY, APP_SECRET,
#         request.session['OAUTH_TOKEN'], request.session['OAUTH_TOKEN_SECRET'])
#         final_step = twitter.get_authorized_tokens(oauth_verifier)
#         request.session['OAUTH_TOKEN'] = final_step['oauth_token']
#         request.session['OAUTH_TOKEN_SECRET'] = final_step['oauth_token_secret']
#         return redirect('/twitter/main/')

# class MainView(View):
#     template = 'app/index.html'

#     def get(self, request):
#         return render(request, self.template)

# class StatusView(View):
#     def post(self, request):
#         twitter = Twython(APP_KEY, APP_SECRET,
#         request.session['OAUTH_TOKEN'], request.session['OAUTH_TOKEN_SECRET'])
#         twitter.update_status(status=request.POST['status'])
#         return JsonResponse({'status': 'Updated!'})

class SearchView(View):
    template = 'twitter/index.html'
    pos = open('twitter/positive.txt')
    neg = open('twitter/negative.txt')   
    positivo = [line.strip().lower() for line in pos] 
    negativo = [line.strip().lower() for line in neg]
    alchemyapi = AlchemyAPI()


    def get(self, request):
       return render(request, self.template)

    def post(self, request):
        positive = 0
        negative = 0
        actual_words = []
        twitter = Twython(APP_KEY, APP_SECRET)
        # request.session['OAUTH_TOKEN'], request.session['OAUTH_TOKEN_SECRET'])
        result = twitter.search(q=request.POST['search'], count=100, result_type=request.POST['type'], lang='en')
        start_point = result['statuses']
        tweets = [tweet['text'] for tweet in start_point if tweet['user']['followers_count'] > 5000]
        words = [word.split(' ') for word in tweets]
        broken_down = [line['entities'] for line in start_point]
        almost_there = [block['hashtags'] for block in broken_down]
        hashtags = [last[0]['text'].lower() for last in almost_there if len(last) > 0]
        for tweets in words:
            for word in tweets:
                actual_words.append(word)
        hash_dict = Counter(hashtags)
        top_hashes = hash_dict.most_common(5)
        for word in actual_words:
            if word.lower() in self.positivo:
                positive += 1
            elif word.lower() in self.negativo:
                negative += 1
        response = self.alchemyapi.sentiment("text", [tweet for tweet in tweets])
        feeling = response.get("docSentiment")
        if feeling == None:
            return JsonResponse({'result' : 'There was a problem searching for ' + request.POST['search'] + '. Please try a different filter.'})
        feeling = feeling["type"]
        response = ['positive' if positive > negative else 'negative']                
        return JsonResponse({'result': 'Your query returned ' + str(positive) +
                                ' positive keywords, and ' + str(negative) + ' negative keywords' +
                                ' People feel ' + feeling + ' about this topic.',
                            'hash': [{'name': hashe['text']} for hashe in start_point],
                            'hashes': [{'name': hashe[0]} for hashe in top_hashes]})



