from flask import Flask
from api.blueprints.orders import orders_blueprint
from api.blueprints.products import products_blueprint
from api.models import db
from flask_cors import CORS, cross_origin

_URL_PREFIX ='/api'
ORDERS_URL = f"{_URL_PREFIX}/orders"
PRODUCTS_URL = f"{_URL_PREFIX}/products"

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/")
@cross_origin()

@app.before_request
def before_request():
    db.connect()

@app.after_request
def after_request(response):
    db.close()
    return response

app.register_blueprint(orders_blueprint, url_prefix=ORDERS_URL)
app.register_blueprint(products_blueprint, url_prefix=PRODUCTS_URL)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5001)