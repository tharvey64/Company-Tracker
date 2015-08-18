import datetime
import os
import json
from django.shortcuts import redirect
from django.views.generic import View
from django.http import JsonResponse
from django.core import serializers
from twython import Twython
from sentiment.alchemyapi import AlchemyAPI
from sentiment.models import Sentiment
from twitter.models import Tweet, Keyword, Profile
from twitter.helper import process_tweets, filter_tweets_by_keyword, process_list_tweets, alchemy_text_sentiment

def tweet_to_json(python_object):
    if isinstance(python_object, datetime.datetime):
        return {'__class__': 'datetime.datetime',
            '__value__': python_object.strftime("%Y-%m-%d %H:%M:%S%z")}
    raise TypeError(repr(python_object) + ' is not JSON serializable')

def make_twython(profile_token=None, profile_secret=None):
    return Twython(
        os.environ['TWITTER_KEY'], 
        os.environ['TWITTER_SECRET'], 
        profile_token, profile_secret)

class AppView(View):

    def get(self, request):
        callback_url = request.META['HTTP_REFERER'] + 'twitter/callback'
        twitter = make_twython()
        auth = twitter.get_authentication_tokens(callback_url=callback_url)
        request.session['OAUTH_TOKEN'] = auth['oauth_token']
        request.session['OAUTH_TOKEN_SECRET'] = auth['oauth_token_secret']
        return redirect(auth['auth_url'])

class CallbackView(View):

    def get(self, request):
        oauth_verifier = request.GET['oauth_verifier']
        twitter = make_twython(request.session['OAUTH_TOKEN'], request.session['OAUTH_TOKEN_SECRET'])
        final_step = twitter.get_authorized_tokens(oauth_verifier)
        request.session['OAUTH_TOKEN'] = final_step['oauth_token']
        request.session['OAUTH_TOKEN_SECRET'] = final_step['oauth_token_secret']
        request.session['screen_name'] = final_step['screen_name']
        return redirect('/users/register')

class SearchView(View):
    alchemyapi = AlchemyAPI()

    def post(self, request):
        user_query = request.POST.get('search')  
        if not user_query:
            return JsonResponse(dict(error="Please enter a search value"))
        
        twitter = make_twython()
        twython_results = twitter.search(q=user_query, 
                            result_type=request.POST['filter'], lang='en')
        stored_tweets_of_query = filter_tweets_by_keyword(user_query.lower())
        
        new_tweets = process_tweets(twython_results['statuses'], stored_tweets_of_query)

        keyword.tweet.add(*new_tweets)
        # Pull Tweet_id out of Tweet object
        if stored_tweets_of_query:
            all_tweets = new_tweets + list(stored_tweets_of_query)
        else:
            all_tweets = new_tweets
        tweet_dataset = [dict(tweet_id=t.tweet_id) for t in all_tweets]
        
        if len(tweet_dataset) is 0:
            data = dict(error='Please simplify your search')
        else:
            data = dict(tweets=tweet_dataset,search_type='popular')
        return JsonResponse(data)

class SearchListView(View):
    # Do This SomeWhere Else
    alchemyapi = AlchemyAPI()

    def post(self, request):
        user_query = request.POST.get('search') 

        profile = Profile.objects.filter(user__pk=request.user.id)

        twitter = make_twython(profile[0].token, profile[0].secret)

        users_lists = twitter.show_owned_lists(screen_name=request.user.username)

        # owned_list_names = (item['name'].lower()==list_name.lower() for item in users_lists['lists'])

        list_name = request.POST.get('listName')
        if not any(item['name'].lower()==list_name.lower() for item in users_lists['lists']): 
            return JsonResponse(dict(error='List Not Found.'))
        # --------------------------------------------------------------------
        # Read In The Timeline
        max_id = None
        # get_specific_list
        timeline = []
        # This Should be a View
        # Add more option so users can look back through the timeline
        for i in range(2):
            list_of_tweets = twitter.get_list_statuses(slug=list_name, owner_screen_name=request.user.username, count=200,max_id=max_id)
            if len(list_of_tweets) == 0:
                break
            timeline+=list_of_tweets
            max_id = list_of_tweets[-1]['id']-1
        # --------------------------------------------------------------------      
        list_dataset = process_list_tweets(user_query,self.alchemyapi,timeline)
        return JsonResponse(dict(tweets=list_dataset,search_type='list'))

# class DeleteTweet(View):

#     def post(self, request, tweet_id):
#         tweet = Tweet.objects.filter(tweet_id=tweet_id)
#         if len(tweet) == 1:
#             tweet.delete()
#             data = {'success':'Successfully Deleted Tweet.'}
#         else:
#             data = {'error':'Tweet Not Found.'}
#         return JsonResponse(data)