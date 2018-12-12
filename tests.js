let star = {dec: "68° 52' 56.9",ra: "16h 29m 1.0s",ma: "test",ca: "test",story: "Found star using lll"};
let decs = star.dec;
var words = decs.split(" ");
console.log(decs[1]);
var myarr = star["dec"].split(" ");

console.log(myarr);
"star": {
    "dec": "68° 52' 56.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
}
//Loading the variable
var mystr = "0000000020C90037:TEMP:data";

//Splitting it with : as the separator
var myarr = mystr.split(":");

console.log(myarr);
