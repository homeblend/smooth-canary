import logging
import os

def create_logger(name, log_level=logging.INFO):
    # TODO put this in a config file eventually
    log_dir = '/var/log/homeblend'
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    log_file = os.path.join(log_dir, '{0}.log'.format(name))
    if not os.path.isfile(log_file):
        os.mkdir(log_file)
    file_handler = logging.FileHandler(log_file)
    formatter = logging.Formatter('%(asctime)s:%(levelname)s:%(filename)s/%(lineno)d\n-->%(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger


