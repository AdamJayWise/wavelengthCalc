/*

TODO
links to product pages
clean up formatting
link to resolution calculator

OK - so for this one, what do I actually want to do?
a wavelength calculator.  Why would I want one?  To simply raman calculations, calculations with cm-1 <-> wavelength

One simple calculation would be
- Rayleigh wavelength
- Raman Shift
- new wavelength

E.g., with excitation at 785, what range would be needed to see 1000 to 3000 cm-1
what would be a cute way to do the interface that's self-explanatory

Maybe work in a range of possible spectrometers and cameras...
How does this work exactly?

[Rayleigh Wavelength, nm],[Raman Shift(s), cm-1],[Raman Wavelength(s), nm]

changing one populates the others... is there a clever way to say, if i, update j,k.... that would be cute.

Another one would be cm-1 <--> microns

So should I do this in D3 or jquery?  I might want some graphs so maybe D3

*/

console.log("wavelengthCalc.js Adam Wise (C)2022")

// rounding function with specific number of decimal places d
function r(n,d){
    return Math.round(n*10**d)/10**d;
}

 // these are with a newton 940, very approx numbers
 var spectrometers = {
    '<a href = "https://andor.oxinst.com/products/kymera-and-shamrock-spectrographs/shamrock-163">Shamrock 163</a>' : {300:0.12, 500:0.15, 750:0.23, 1000:0.52,},
    '<a href = "https://andor.oxinst.com/products/kymera-and-shamrock-spectrographs/kymera-193i">Kymera 193i</a>': {300: 0.1 , 500:0.13, 750:0.19, 1000:0.43,},
    '<a href = "https://andor.oxinst.com/products/kymera-and-shamrock-spectrographs/kymera-328i">Kymera 328i</a>' : {300: 0.05 , 500: 0.06, 750: 0.09, 1000:0.12,},
    '<a href = "https://andor.oxinst.com/products/kymera-and-shamrock-spectrographs/shamrock-500i">Shamrock 500i</a>' : {300: 0.03 , 500:0.03, 750:0.05, 1000:0.04,},
    '<a href = "https://andor.oxinst.com/products/kymera-and-shamrock-spectrographs/shamrock-750">Shamrock 750</a>' : {300: 0.02 , 500: 0.02, 750: 0.04, 1000:0.05,},
}

function getRes(obj, lambda){
// put your goggles on this is about to get GROSS
wavelengths = Object.keys(obj)
wavelengths.sort(function(a,b){return a-b})  // sort the wavelength keys in case they're out of order

if (wavelengths.indexOf(String(lambda))!=-1){
    return obj[String(lambda)]
}

if (lambda < wavelengths[0]){
return 0;
}

if (lambda > wavelengths.slice(-1)[0]){
return 0;
}

var indexAbove = wavelengths.findIndex( function(x){return x>lambda});
var wavelengthBounds = [wavelengths[indexAbove-1], wavelengths[indexAbove]];
var EffBounds = [obj[wavelengthBounds[0]], obj[wavelengthBounds[1]]];

// calculate the slope for linear interpolation
var M = (EffBounds[1]-EffBounds[0])/(wavelengthBounds[1]-wavelengthBounds[0])

// return a linearly interpolated value for the Eff at a specific wavelength lambda
return M*(lambda - wavelengthBounds[1]) + EffBounds[1]
}


var app = {
            rayleighWavelenthNm : 488, //rayleight wavelength in nm
            ramanShiftCm : [1000], //array of raman shifts in cm
            ramanShiftNm : [(10**7)/ ((10**7)/488 - 1000)], //array of raman shifts in nm
            ramanResolutionCm : 5,
            ramanResolutionNm :  0.1190429535192834,
            }

// populate text inputs with initial values from the app object
function updateText(){
    d3.select("#rayleighWavelengthNm").property('value', app.rayleighWavelenthNm)
    d3.select("#rayleighWavelengthDisplay").text(app.rayleighWavelenthNm)
    d3.select("#ramanShiftCm").property('value', app.ramanShiftCm)
    d3.select("#ramanShiftNm").property('value', app.ramanShiftNm.map(x=>r(x,2)).join(', '))
    d3.select("#ramanResolutionCm").property('value', app.ramanResolutionCm)
    d3.select("#ramanResolutionNm").property('value', r(app.ramanResolutionNm,2))

    // ok now lets run through the spectrometers and add their names to a list of acceptable spectrometers
    var availableSpectrometers = Object.keys(spectrometers)
    app.acceptableSpectrometers = []
    console.log(app.rayleighWavelenthNm)
    availableSpectrometers.forEach(function(s){
        var res = getRes(spectrometers[s], app.rayleighWavelenthNm)
        console.log(s,res)
        if( (res>0) && (res<= app.ramanResolutionNm) ){
            console.log(' Consider ' + s)
            app.acceptableSpectrometers.push({'name':s})
        }
    })
    
    // I can't remember how to do this better and I'm choosing violence
    d3.select('#spectrometers').selectAll('li').remove()
    
    d3.select('#spectrometerRecommendations')
        .select('#spectrometers')
        .selectAll('li')
        .data(app.acceptableSpectrometers).enter().append('li').html(s=>s.name)
}

updateText();



// callback for what happens when rayleigh wavelength input is changed
var rayleighInput = d3.select("#rayleighWavelengthNm");
rayleighInput.on('change',function(){
                    //take the input and try to parse it as a number.  if we can make it the rayleigh wavelength
                    // if we can update if the rayleight wavelength, update raman shifts nm from raman shifts cm?
                    var newVal = d3.select(this).property('value');
                    if (1){
                        app.rayleighWavelenthNm = Number(newVal);

                        // update raman shift in nm
                        app.ramanShiftNm = app.ramanShiftCm.map(x=>(10**7)/ ((10**7)/app.rayleighWavelenthNm - x))

                        // update raman resolution
                        app.ramanResolutionNm = app.rayleighWavelenthNm - 10**7/ (10**7/(app.rayleighWavelenthNm) + app.ramanResolutionCm);


                        updateText()
                    }

                })

// callback for what happens when required resolution is changed
d3.select("#ramanResolutionCm").on("change", function(){
                    var newVal = d3.select(this).property('value');
                    app.ramanResolutionCm = Number(newVal);
                    console.log(newVal)
                    // updated raman resolution in nm
                    app.ramanResolutionNm = app.rayleighWavelenthNm - 10**7/ (10**7/(app.rayleighWavelenthNm) + app.ramanResolutionCm);
                    

                    updateText();
                    })

// callback for what happens when raman peak wavenumber values are changed
d3.select("#ramanShiftCm").on("change", function(){
    var newVal = d3.select(this).property('value');
    app.ramanShiftCm = newVal.split(',').map(x=>Number(x));
    app.ramanShiftNm = app.ramanShiftCm.map(x=> 10**7 / (10**7/app.rayleighWavelenthNm - x))
    console.log(newVal)
    console.log(app.ramanShiftCm)


    d3.select('#ramanShiftNm').style('width',app.ramanShiftCm.length*70+'px')
    

    updateText()

    })

    /**
     * Now how would you go about "disqualifying" different spectrometers based on resolution and wavelength requirements?
     * I could embed some of the resolution calculator code, possibly re-written?
     * is there a simpler, if maybe less accurate way? Could I figure out a rough function for wavelength vs. max res and interpolate on that?
     * so eg
     */

   
