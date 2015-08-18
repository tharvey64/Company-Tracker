import datetime
from twitter.models import Tweet,Keyword

def filter_tweets_by_keyword(search):
    keyword, created = Keyword.objects.get_or_create(search=search)
    if not created:
        stored_tweets = keyword.tweet.all()#tweets in the database
    else:
        stored_tweets = []
    return stored_tweets

def stored_tweet(query_set, current_tweet):
    old_tweet = query_set.filter(tweet_id=current_tweet['id_str'])
    # ensure 'id_str' is unique
    if old_tweet and len(old_tweet) == 1:
        old_tweet[0].favorites = current_tweet['favorite_count']
        old_tweet[0].save()
        return old_tweet[0]
    else:
        return None

def create_keywords(list_of_keywords, obj):
    for word in list_of_keywords:
        k, created = Keyword.objects.get_or_create(search=word)
        k.tweet.add(obj)

def make_tweet(current_tweet):
    formatted_date = datetime.datetime.strptime(current_tweet['created_at'], "%a %b %d %X %z %Y")
    
    tweet_obj = Tweet.objects.create(
        text=current_tweet['text'], 
        tweet_id=current_tweet['id_str'], 
        favorites=current_tweet['favorite_count'],
        tweet_date=formatted_date
    )
    keywords = ('#' + tag['text'] for tag in current_tweet['entities']['hashtags'])
    # function doesnt return anything 
    create_keywords(keywords, tweet_obj)
    return tweet_obj

def process_tweets(twitter_results, db_results):
    new_tweets = []
    for response in twitter_results: #iterating through each tweet
        if db_results and stored_tweet(db_results,response):
            continue
        else:
            tweet = stored_tweet(Tweet.objects, response)
            if not tweet:
                tweet = make_tweet(response)
            if tweet:
                # can't i use the list i am iterating over
                new_tweets.append(tweet)
    return new_tweets