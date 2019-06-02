# Built-in
from time import sleep
from datetime import datetime

# 3rd party
import grovepi
from google.cloud import firestore

# Homeblend
import utils


class SmoothCanary:
    """
    Periodically reads gas data from the grovepi and add it to our firestore database

    This is a simple infrastructure, I could foresee using RabbitMQ to coordinate reading in data
    from several different sensors placed throughout the home
    """
    def __init__(self):
        self.logger = utils.create_logger('smooth_canary')
        self.logger.info('Initializing SmoothCanary')
        self.firestore_client = None
        # in seconds
        self.READ_RATE = 30
        self.INPUT_PIN = 15
        grovepi.pinMode(self.INPUT_PIN, "INPUT")
        self.firestore_client = firestore.Client()
        self.logger.info('SmoothCanary initialized')

    def start(self):
        self.logger.info('Starting read loop')
        while True:
            gas_reading = grovepi.analogRead(self.INPUT_PIN)
            if gas_reading:
                self.logger.info('Gas reading: {0}'.format(gas_reading))
                # TODO if we plan on leaving this running continuously,
                #  we'll need to limit our readings to the last 30 days.
                #  This will keep the amount of data we store down, which
                #  means I hopefully won't get charged for storage.
                self.firestore_client.collection('readings').add({
                    'reading': gas_reading,
                    'timestamp': datetime.now()
                })
            else:
                self.logger.warning('Received bad reading: {0}'.format(gas_reading))
            sleep(self.READ_RATE)


if __name__ == "__main__":
    SmoothCanary().start()
