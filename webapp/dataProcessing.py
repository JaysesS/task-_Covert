# ALL BACKEND HERE

import requests, json, threading, time
from datetime import datetime
from dateutil.relativedelta import relativedelta

# Class responsible for communication with the database
class Database:

    import pyrebase

    # Init Firebase
    config = {
        "apiKey": "AIzaSyB8S59bFxl5mFPPsNR856RYAuaClWBBweE",
        "authDomain": "webbapp-task.firebaseapp.com",
        "databaseURL": "https://webbapp-task.firebaseio.com",
        "storageBucket": "webbapp-task.appspot.com",
    }

    firebase = pyrebase.initialize_app(config)
    db = firebase.database()
    auth = firebase.auth()
    user = auth.sign_in_with_email_and_password("SpecialForTaskFirebase@gmail.com", "qwerty12345_7331")['idToken']

    # Updating fields in the database
    def UpdateChild(self, child, args):
        data = {
            "priceUsd": args[0],
            "mempoolTransactions": args[1],
            "transactions24": args[2],
            "transactions" : args[3],
            "volume" : args[4],
            "priceUsdChange" : args[5],
            "transactionFeeUsd" : args[6]
        }
        self.db.child(child).update(data, self.user)
    
    # Update the end time field (hardfork) in the database
    def UpdateTime(self, timeField, value):
        self.db.update({timeField : value}, self.user)

    # Adding history to the database
    def setHistory(self, args):
        data = {
            "priceUsd": args[0],
            "mempoolTransactions": args[1],
            "transactions24": args[2],
            "transactions" : args[3],
            "volume" : args[4],
            "priceUsdChange" : args[5],
            "transactionFeeUsd" : args[6]
        }
        self.db.child("history").child(int(time.time())).set(data, self.user)

# Сlass responsible for communicating with the api and populate the database
class TaskLogic:

    # Use blockchair.com to get data
    url = 'https://api.blockchair.com'

    # Сlass Database initialization
    database = Database()
    
    # Auxiliary is used to record the history
    unixSaveHistory = 0

    # Time hardfork
    endTime = 0

    # Used to set a delay when retrieving data from the api (sec)
    refreshStatsRate = 10

    # Used to set a delay if there was an error retrieving data from the api (sec)
    refreshBadStatsRate = 15

    # Used to set the recording delay in history
    saveHistoryRate = 60

    # Getting data from api with set delay
    def loop(self):

        while (True):
            
            # Getting data from api
            priceUsd = self.getPriceUsd()
            mempool_transactions = self.getMempoolTransactions()
            transactions24 = self.getTransactions24()
            transactions = self.getTransactions()
            volume = self.getVolume24()
            priceUsdChange = self.getPriceUsdChange24()
            transactionFeeUsd = self.getTransactionFeeUsd24()

            # If an error occurs in retrieving data
            if ((priceUsd is None) or 
                (mempool_transactions is None) or
                (transactions24 is None) or 
                (transactions is None) or 
                (volume is None) or 
                (priceUsdChange is None) or 
                (transactionFeeUsd is None)):

                time.sleep(self.refreshBadStatsRate)

            # If data is received
            if ((priceUsd is not None) and 
                (mempool_transactions is not None) and 
                (transactions24 is not None) and 
                (transactions is not None) and 
                (volume is not None) and 
                (priceUsdChange is not None) and 
                (transactionFeeUsd is not None)):

                args = [priceUsd, mempool_transactions, transactions24, transactions, volume, priceUsdChange, transactionFeeUsd]
                self.database.UpdateChild("info", args)

                # Check and if true means data is written to history
                if (int(time.time()) - self.unixSaveHistory >= self.saveHistoryRate):
                    self.unixSaveHistory = int(time.time())
                    self.database.setHistory(args)
                time.sleep(self.refreshStatsRate)

            # Check for hardfork, if true then the data acquisition cycle stops
            if (self.endTime <= int(datetime.timestamp(datetime.now()))):
                break

    # Starts the information retrieval cycle
    def startLoop(self):
        threading.Thread(target=self.loop).start()

    # The entry in the database time hardfork
    def setEndTime(self, t):
        time = datetime.now()
        self.endTime = int(datetime.timestamp(time + relativedelta(seconds=int(t))))
        self.database.UpdateTime("time", self.endTime)
    
    # Methods to get data from api
    def getPriceUsd(self):
        localurl = '{}/bitcoin-cash/stats'.format(self.url)
        try:
            price = requests.get(localurl).json()['data']['market_price_usd']
            return price
        except TypeError:
            pass
    
    def getTransactions24(self):
        localurl = '{}/bitcoin-cash/stats'.format(self.url)
        try:
            transactions24 = requests.get(localurl).json()['data']['transactions_24h']
            return transactions24
        except TypeError:
            pass

    def getTransactions(self):
        localurl = '{}/bitcoin-cash/stats'.format(self.url)
        try:
            transactions = requests.get(localurl).json()['data']['transactions']
            return transactions
        except TypeError:
            pass

    def getVolume24(self):
        localurl = '{}/bitcoin-cash/stats'.format(self.url)
        try:
            volume = requests.get(localurl).json()['data']['volume_24h']
            return volume
        except TypeError:
            pass

    def getPriceUsdChange24(self):
        localurl = '{}/bitcoin-cash/stats'.format(self.url)
        try:
            priceUsdChange = requests.get(localurl).json()['data']['market_price_usd_change_24h_percentage']
            return priceUsdChange
        except TypeError:
            pass

    def getTransactionFeeUsd24(self):
        localurl = '{}/bitcoin-cash/stats'.format(self.url)
        try:
            transactionFeeUsd = requests.get(localurl).json()['data']['median_transaction_fee_usd_24h']
            return transactionFeeUsd
        except TypeError:
            pass

    def getMempoolTransactions(self):
        localurl = '{}/bitcoin-cash/stats'.format(self.url)
        try:
            transactions = requests.get(localurl).json()['data']['mempool_transactions']
            return transactions
        except TypeError:
            pass