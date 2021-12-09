const path = require("path");
const express = require("express");
const fs = require("fs");
const hbs = require("ejs");
const { json } = require("express");
const { resourceUsage } = require("process");
const { fstat } = require("fs");





const amazon = "./utils/Amazon";
// const fastcsv=require("fast-csv")

const port = process.env.PORT || 5500; //port 3000 ya phir kissi aur port pe

const app = express();

//define paths for express config
const publicDirectoryPath = path.join(__dirname, "../public/dark");
const viewPath = path.join(__dirname, "../templates/views");
// const partialsPath=path.join(__dirname,'../templates/partials')

app.use(express.json()); //jason file ka use krna h apne is node js me
app.use(express.urlencoded({ extended: false })); //jo data likunga usko main get krna chahunga

//setup handelbars engines and view location
// app.set("view engine", "hbs");
app.set('view engine', 'ejs')
app.set("views", viewPath);
// hbs.registerPartials(partialsPath)

//setup static directory to serve

app.use(express.static(publicDirectoryPath));

app.get("", (req, res) => {
  res.render("index", {
    // title:'about me',
    // name:'amndrew'
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});




//blogging position//

const mongoose = require('mongoose')
const Article = require('../models/article')
const articleRouter = require('../routes/articles')
const methodOverride = require('method-override')


mongoose.connect('mongodb://127.0.0.1:27017/', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.get('/resume', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/resume', { articles: articles })
})

app.use('/articles', articleRouter)




app.get("/services", (req, res) => {
  res.render("services");
});
app.get("/download", (req, re) => {
  res.render("download");
});

app.post("/services", async (req, res) => {
  const url = req.body.get_url;

  try {

    console.log(url);
    // const download=req.body.submit
    // res.render("download")

    const request = require("request-promise");
    const cheerio = require("cheerio");
    const downloader = require("node-image-downloader");
    const ObjectsToCsv = require("objects-to-csv");
    const url1 = url; //"https://www.amazon.in/s?k=shirts&rh=n%3A1375424031&ref=nb_sb_noss";
    const scrapesample = {
      title: "U-TURNMens Slim Fit Shirt",
      rating: "4 out of 5",
      offer_price: "499",
      origional_price: "1999",
      description: "Crafted in a pure cotton fabric, this long-sleeved, regulr",
      url:
        "https://www.amazon.in/Diverse-Printed-Regular-Cotton-DVF01F2L01-263-42_Navy_42/dp/B075KKF5XL/ref=sr_1_1?dchild=1&pf_rd_i=1968024031&pf_rd_m=A1VBAL9TL5WCBF&pf_rd_p=08b03935-0704-4bbd-9894-f9c043ef766b&pf_rd_r=6YXAMFJD4JPDGFJ0P7VJ&pf_rd_s=merchandised-search-17&qid=1618197259&refinements=p_36%3A-49900&rnid=1968024031&s=apparel&sr=1-1",

      package_dimension: "8 x 8 x 3 cm; 400 Grams",
      date_of_manufacure: "30 August 2020",
      manufacturer: " Swastik Health Wear",
      asin: " B0917B969K",
      country_origin: "India",
      department: "Men",
      manufacturer:
        "Swastik Health Wear, Swastik Health Wear, Wazirpur Industrial Area, New Delhi - 110052",
    };

    let scrapeResults = [];

    async function productDetail() {
      try {
        const htmlResult = await request.get(url);
        const $ = await cheerio.load(htmlResult);
        if ($(".sg-col-4-of-12")) {
          $(".sg-col-4-of-12").each((index, element) => {
            const str = $(element).find(".a-size-mini").text(); // title of product
            var newstr1 = "";

            for (var i = 0; i < str.length; i++) {
              if (!(str[i] == "\n" || str[i] == "\r")) {
                newstr1 += str[i];
              }
            }
            const title = newstr1;
            const rating = $(element).find(".a-icon-alt").text(); // rating of product
            const offer_price = $(element).find(".a-price-whole").text(); //offerprice of product
            const origional_price = $(element).find(".a-offscreen").text(); //origiona price of product
            const original = $(element).find(".a-link-normal").attr("href"); //url of product
            const url = "https://www.amazon.in/" + original;
    
            const scrapeResult = {
              title,
              rating,
              offer_price,
              origional_price,
              url,
            };
            scrapeResults.push(scrapeResult);
          });
        }

        //for leptop and fridge type page
        else {
          $(".sg-col-0-of-12").each((index, element) => {
            const title = $(element).find(".a-size-mini").find(".a-size-medium").text(); // title of product
            var newstr1 = "";

            // for (var i = 0; i < str.length; i++) {

            //     if (!(str[i] == '\n' || str[i] == '\r')) {

            //         newstr1 += str[i];
            //     }

            // }
            // const title = newstr1;
            const rating = $(element).find(".a-icon-alt").text(); // rating of product
            const offer_price = $(element).find(".a-price-whole").text(); //offerprice of product
            const origional_price = $(element).find(".a-offscreen").text(); //origiona price of product
            const original = $(element).find(".a-link-normal").attr("href"); //url of product
            const url = 'https://www.amazon.in/' + original;
            const scrapeResult = { title, rating, offer_price, origional_price, url };
            scrapeResults.push(scrapeResult);
          });

        }
        console.log(scrapeResults);

        //console.log(htmlResult);
      } catch (err) {
        console.error(err);
      }
      return scrapeResults;
    }

    async function product_basic_descrpiton(productwithHeader) {
      return await Promise.all(
        productwithHeader.map(async (job) => {
          try {
            const htmlResult = await request.get(job.url);
            const $ = await cheerio.load(htmlResult);
            const str1 = $("#productDescription").text();
            // console.log(typeof(str));
            var newstr = "";

            for (var i = 0; i < str1.length; i++) {
              if (!(str1[i] == "\n" || str1[i] == "\r")) {
                newstr += str1[i];
              }
            }
            job.description = newstr;

            const str10 = $("#detailBullets_feature_div")
              .children(".a-unordered-list")
              .text()
              .trim();
            var newstr10 = "";
            var newstr20 = "";

            for (var i = 0; i < str10.length; i++) {
              if (!(str10[i] == "\n" || str10[i] == "\r")) {
                newstr10 += str10[i];
              }
            }
            // const des=newstr10;
            const str11 = $("#feature-bullets")
              .children(".a-unordered-list")
              .text()
              .trim();
            for (var i = 0; i < str11.length; i++) {
              if (!(str11[i] == "\n" || str11[i] == "\r")) {
                newstr20 += str11[i];
              }
            }
            // const des2=newstr20;
            job.des = newstr10;
            job.dis2 = newstr20;

            return job;
          } catch (error) {
            console.error(error);
          }
        })
      );

    }

    async function createCsvFile(data) {
      const csv = new ObjectsToCsv(data);

      // Save to file:
      await csv.toDisk("./scrapy/public/dark/uploadfiles/amazon.csv");

      // Return the CSV file as string:
      console.log(await csv.toString());
    }

    async function product_basic() {
      const productwithHeader = await productDetail();
      const productFullData = await product_basic_descrpiton(productwithHeader);
      //document.getElementById("#result").innerHTML=productFullData//console.log(productFullData);
      await createCsvFile(productFullData);
      // await res.status(201).render("download");
    }
    product_basic();
    // productDetail();
    await res.status(201).render("download");
  } catch (error) {
    res.status(400).send(error);
  }
  // res.status(201).render("download");

  // if (file = ! "") {
  //   //google translate

  //   const chromeOption = require('selenium-webdriver/chrome');
  //   var webdriver = require('selenium-webdriver'),
  //     By = webdriver.By;
  //   fs = require('fs');
  //   var parser = require('csv-parse');
  //   var chrome = require('chromedriver');
  //   var driver = new webdriver.Builder()
  //     .forBrowser('chrome')
  //     //.setChromeOptions(new chromeOption.Options().headless()) //headless means work in the background without opening a browser
  //     .build();
  //   driver.get('https://translate.google.com/');
  //   const CsvFilePath = './Excel Files/translations.csv';
  //   var languages = require('./languages.js').languages;
  //   var CsvData = {
  //     text: [],
  //     language: [],
  //   };
  //   var count = 0; var index = 0; var finalData = [];
  //   Pause(1, ReadCsvFile);

  //   /**
  //    * Reads the data from csv file translations.csv file
  //    * Save data to CsvData.text [contains text from column 1] 
  //    * Save data to CsvData.language [contains language from column 2]
  //    */
  //   function ReadCsvFile() {
  //     console.log("Reading CSV File...");
  //     var parse = parser({ delimiter: ',' }, function (error, data) {
  //       data.forEach(function (data) {
  //         CsvData.text.push(data[0]);
  //         CsvData.language.push(data[1]);
  //       });
  //     });
  //     fs.createReadStream(CsvFilePath).pipe(parse);
  //     Pause(3, ScrapeGoogleTranslate);
  //   }

  //   function ScrapeGoogleTranslate() {
  //     console.log("Running ScrapeGoogleTranslate function...");
  //     Pause(2, function () {
  //       if (count != CsvData.text.length) {
  //         if (CsvData.text[count].length <= 5000) {
  //           driver.findElement(By.className('er8xn')).sendKeys(CsvData.text[count]);
  //           console.log(CsvData.text[count].length);
  //           //driver.findElement(By.className('tl-more tlid-open-target-language-list')).click();
  //           driver.findElement(By.xpath("//*[@aria-label='More target languages']")).click();
  //           var sourceDelay = GetSourceDelay();
  //           console.log("Time required in seconds for RHK Internet Connection = " + sourceDelay);
  //           Pause(sourceDelay, function () {
  //             /** here languages[0] contains array langNames : id from languages.js file
  //              *  we need to first check that whether the language from csv file [colum 2]
  //              *  exists in languages.js file
  //              *  if it exists then we have to obtain that language id which is refered as
  //              *  targetLanguageId below
  //              *  Examples csvData.language[0] = 'afrikaans'
  //              *  languages[0][csvData.language[0]] => languages[0]['afrikaans'] yes its exists
  //              *  in languages.js file so we have to get this language id i.e targetLanguageId
  //              *  var targetLanguageId = languages[0][csvData.language[0], since
  //              *  csvData.language[0] contains afrikaans above so languages[0]['afrikaans'] will
  //              *  return its id i.e "af"
  //              */
  //             if (languages[0][CsvData.language[count].toLowerCase()]) {
  //               var ids = languages[0][CsvData.language[count].toLowerCase()];
  //               console.log("language exists");
  //               var targetLanguageId = ids.trim();
  //               console.log(targetLanguageId);
  //               /**
  //               * Following are some cases that may cause exception to occur so handle them accordingly
  //               * 1st case: we are selecting new language
  //               * 2nd case: language is selected that was selected previously
  //               * 3rd case: language is present in the top menu
  //               */
  //               //    //1st case
  //               // //  driver.findElement(By.xpath("//[@data-language-code='en']")).click().catch(function(exception){
  //               driver.findElement(By.xpath("//[@data-language-code='" + targetLanguageId + "']")).click();

  //               //   //2nd case
  //               //   driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+targetLanguageId+'item-selected item-emhasized"]')).click().catch(function(exception){
  //               //     console.log("Exception caught 2 ");
  //               //   });
  //               //   //3rd case
  //               //   driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+targetLanguageId+'item-emhasized"]')).click().catch(function(exception){
  //               //     console.log("Exception caught 3 ");
  //               //   });
  //               //   //4th case
  //               //   driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+targetLanguageId+'item-selected"]')).click().catch(function(exception){
  //               //     console.log("Exception caught 4 ");
  //               //   });
  //               var targetDelay = GetTargetDelay();
  //               Pause(targetDelay, function () {
  //                 driver.findElement(By.xpath('//*[@jsname="W297wb"]')).getText().then(function (translatedText) {
  //                   console.log(translatedText);
  //                   finalData.push({
  //                     text: "\"" + CsvData.text[count] + "\"",
  //                     languageToTranslateText: "\"" + CsvData.language[count] + "\"",
  //                     translatedText: "\"" + translatedText + "\""
  //                   });
  //                   AddDataToExcel(finalData);
  //                   driver.findElement(By.className('er8xn')).clear();
  //                   count++;
  //                   ScrapeGoogleTranslate();
  //                 });
  //               });
  //             } else {
  //               console.log("language not found on Google. ");
  //               driver.findElement(By.xpath("//*[@aria-label='More target languages']")).click();
  //               finalData.push({
  //                 text: "\"" + CsvData.text[count] + "\"",
  //                 languageToTranslateText: "\"" + CsvData.language[count] + "\"",
  //                 translatedText: 'Language Not Found.'
  //               });
  //               AddDataToExcel(finalData);
  //               driver.findElement(By.className('er8xn')).clear();
  //               count++;
  //               ScrapeGoogleTranslate();
  //             }
  //           });
  //         } else {
  //           console.log("The text that need to be translated limited to 5000 characters only.");
  //           finalData.push({
  //             text: "\"" + CsvData.text[count] + "\"",
  //             languageToTranslateText: "\"" + CsvData.language[count] + "\"",
  //             translatedText: 'The text that need to be translated limited to 5000 characters only.'
  //           });
  //           AddDataToExcel(finalData);
  //           driver.findElement(By.className('er8xn')).clear();
  //           count++;
  //           ScrapeGoogleTranslate();
  //         }
  //       } else {
  //         console.log("All data has been parsed");
  //         QuitDriver();
  //       }
  //     });
  //   }
  //   /**
  //    * Appends translated data to translatedData.csv file with text, lang source file
  //    */
  //   function AddDataToExcel(array) {

  //     fs.appendFileSync('../public/dark/translatedData.csv', ''
  //       + array[index].text + ','
  //       + array[index].languageToTranslateText + ','
  //       + array[index].translatedText + ','
  //       + '\n');
  //     array = [];
  //     index++;
  //   }
  //   /**
  //    * Gets source delayFactor in seconds based on the text length from translations.csv file [column 1]
  //    */

  //   function GetSourceDelay() {
  //     var length = CsvData.text[count].length, delayFactor = 2;
  //     if (length >= 300 && length <= 500) {
  //       delayFactor = 4;
  //     } else if (length >= 501 && length <= 1000) {
  //       delayFactor = 8;
  //     } else if (length >= 1001 && length <= 2000) {
  //       delayFactor = 12;
  //     } else if (length >= 2001 && length <= 3000) {
  //       delayFactor = 15;
  //     } else if (length >= 3001 && length <= 4000) {
  //       delayFactor = 18;
  //     } else if (length >= 4001 && length <= 5000) {
  //       delayFactor = 22;
  //     }
  //     return delayFactor;
  //   }

  //   /**
  //    * Gets target delayFactor in seconds based on the text length from translations.csv file [column 1]
  //    */
  //   function GetTargetDelay() {
  //     var length = CsvData.text[count].length, delayFactor = 2;
  //     if (length >= 2500 && length <= 5000) {
  //       delayFactor = 5;
  //     }
  //     return delayFactor;
  //   }


  //   /**
  //   adding seleinum wait
  //    * Delay in seconds
  //    * @param int time
  //    * @param function func
  //    */
  //   function Pause(Time, FuncName) {
  //     setTimeout(FuncName, Time * 1000);
  //   }

  //   /**
  //   * Closing and then quiting the driver after scrapping has been done
  //   */
  //   function QuitDriver() {
  //     driver.close();
  //     driver.quit();
  //   }

  //   res.status(201).render("download");
  // }
});

app.post("/download", (req, res) => { });

app.get("/testimonials", (req, res) => {
  res.render("testimonials");
});

app.get("/welcome", (req, res) => {
  res.render("welcome");
});
app.get("/works", (req, res) => {
  res.render("works");
});

//404 not found
// app.get("*", (req, res) => {
//   res.render("404", {
//     title: 404,
//     name: "Himanshu Kaushal",
//     errorMessage: "Page not found",
//   });
// });

// })
app.listen(port, () => {
  console.log(`server is up on port ${port}!`);
});
