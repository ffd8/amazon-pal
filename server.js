// amazon-pal, cc teddavis.org 2022

let online = false;

var express = require('express');
var http = require('http');

const amazonScraper = require('amazon-buddy');

var app = express();

let tPort = process.env.PORT || 3000;
if(process.argv.slice(2).length > 0){
	tPort = process.argv.slice(2)[0];
}

app.set('port', tPort);

var server = http.createServer(app);
const listener = server.listen(tPort, function() {
	if(online){
		console.log('amazon-pal is running! port: ' + listener.address().port);
	}else{
		console.log('amazon-pal is running! http://localhost:' + listener.address().port);
	}
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// handle call
app.get('/', function(req, res){

	if(req.query.q){
		let q = req.query.q;
		let qcount = req.query.qcount || 50;
		let rcount = req.query.rcount || 50;
		let rmin = req.query.rmin || 1;
		let rmax = req.query.rmax || 5;

		(async () => {
		    try {
		        // Collect 50 products from a keyword 'xbox one'
		        // Default country is US
		        const products = await amazonScraper.products({ keyword: q, number: qcount }); // , sort:true
		        const product = products.result[0]
		        

				const reviews = await amazonScraper.reviews({ asin: product.asin, number: rcount, rating: [rmin, rmax] });
				const asin = await amazonScraper.asin({ asin: product.asin});

				const fullData = {
					query: q,
					products: products,
					product: product,
					reviews: reviews,
					asin: asin.result[0]
				}

				  	res.send(fullData)

		    } catch (error) {
		        console.log(error);
		    }
		})();
		
	}else{
		res.send(`
			<b>api call</b><br>
			<a href="?q=your-text-here">http://${req.get('host')}?q=searchTerm</a><br><br>
			
			<b>extra options</b> <br>
			&qcount=50 // products count<br>
			&rcount=50 // reviews count<br>
			&rmin=1 // min-rating<br>
			&rmax=5 // max-rating<br><br>

			<b>example</b><br>
			<a href="http://${req.get('host')}?q=battery&rcount=100&rmax=2" target="_blank">http://${req.get('host')}?q=battery&rcount=100&rmax=2</a><br><br>

			<br><br>
			<b>source code</b><br>
			<a href="">github</a>
		`);
	}
});