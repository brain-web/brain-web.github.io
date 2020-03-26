$(document).ready(function(){
    $('.header').height($(window).height());

    /* This code has to be executed after ".header" height is changed */
    var h = window.location.hash;
    if (h) {
        setTimeout(()=>{
            console.log("BIM", h, $(h).offset().top)
            $('html, body').stop().animate({
                scrollTop : $(h).offset().top
            }, 1000);
        },1000);
    }

    /* Scroll functionality based on the offset of each #elementsection */
    $(".navbar a.nav-link").click(function(){
        if($(this).data('value')) {
            $("body,html").animate({
                scrollTop: $("#" + $(this).data('value')).offset().top
            },1000)
        }
    })

    /* for the projects overview gallery */
    $(".fancybox").fancybox({
        openEffect: "none",
        closeEffect: "none"
    });
    /* to have a smooth fade in of the grey project overlay over image */
    $(".zoom").hover(function(){
        $(this).addClass('transition');
    }, function(){
        $(this).removeClass('transition');
    });

    /* toggle logo once it is hovered over */
    $(".logo_brainweb").hover(
        /*function() {$(this).attr("src","../images/logo/logo_inverted.svg");},
        function() {$(this).attr("src","../images/logo/logo.svg");*/
        function(){
        $(this).addClass('transition');
    }, function(){
        $(this).removeClass('transition');
    });

    /* toggle collapsed menuBar icon once it is hovered over */
    $(".myCollapsedMenuBarIcon").hover(
        function() {$(this).attr("src","../images/logo/menubar_inverted.svg");},
        function() {$(this).attr("src","../images/logo/menubar.svg");
    });
})

/* go back to main page from sub pages */
function goTo(url){
    window.location.href = url;
}

/* hide menu bar once an entry is clicked */
$(function() {
    var menuVisible = false;
    $('#myMenuBtn').click(function() {
        if (menuVisible) {
            $('#myMenu').css({'display':'none'});
            menuVisible = false;
            return;
        }
        $('#myMenu').css({'display':'block'});
        menuVisible = true;
    });
    $('#myMenu').click(function() {
        $(this).css({'display':'none'});
        menuVisible = false;
    });
});

/* filter for project overview gallery on index page */
$(function() {
    var selectedClass = "";
    $(".filter").click(function(){
        selectedClass = $(this).attr("data-rel");
        $("#maingallery").fadeTo(100, 0.1);
        $("#maingallery div").not("."+selectedClass).fadeOut().removeClass('animation');
        setTimeout(function() {
        $("."+selectedClass).fadeIn().addClass('animation');
        $("#maingallery").fadeTo(300, 1);
    }, 300);
    });
});

/* hide elements until compilation completed */
const selectedChart = parseInt(2*Math.random());
function unhide() {
    const elems = document.querySelectorAll(".hide");
    [].forEach.call(elems, function(el) {
        el.classList.remove("hide");
    });
}

/* Include Q-cards for projects */
// Quasar.iconSet.set(Quasar.iconSet.svgMaterialIcons)
Quasar.Dark.set(true)

const app = new Vue({
    el: '#q-app',
    data () {
        return {
            projects: [],
        }
    },
    methods: {
        goTo (url) {
            window.location = url
        },
    }
})

async function get_1st_image_from_md(url) {
    console.log("Trying", url);
    var pr = new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send(null);
        xhr.onreadystatechange = function () {
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            let imgSrc = null;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    const text = xhr.responseText;
                    const arr = text.match(/(https:[^\) ]+)/);
                    if(arr !== null && arr[0] !== null) {
                        imgSrc = arr[0];
                    }
                } else {
                    // console.log('Error: ' + xhr.status); // An error occurred during the request.
                }
                resolve(imgSrc);
            }
        }
    });
    return pr;
}

// get first image from ReadMe for all repositories
async function get_1st_image_from_readme(repoURL) {
    const url = repoURL.replace("https://github.com/","https://raw.githubusercontent.com/") + "/master";
    let imgSrc;    
    imgSrc = await get_1st_image_from_md(url + '/README.md');
    if(imgSrc === null) {
        imgSrc = await get_1st_image_from_md(url + '/ReadMe.md');
    } else if(imgSrc === null) {
        imgSrc = await get_1st_image_from_md(url + '/readme.md');
    } else if(imgSrc === null) {
        imgSrc = await get_1st_image_from_md(url + '/Readme.md');
    }
    console.log("Got:", imgSrc);
    return imgSrc;
}

// get repo list
async function get_repo_list() {
    const defaultImages = [
        "https://generative-placeholders.glitch.me/image?width=300&height=200&style=triangles",
        "https://generative-placeholders.glitch.me/image?width=300&height=200"
    ]
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.github.com/search/repositories?q=topic:brainweb');
    xhr.send(null);
    xhr.onreadystatechange = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
            const res = JSON.parse(xhr.responseText);
            console.log(res);
            for(repo of res.items) {
                ((aRepo) => {
                    const {name, description, html_url} = aRepo;
                    const imgSrc = get_1st_image_from_readme(html_url).then((res) => {
                        app.projects.push({
                            imgSrc:(res)?res:defaultImages[parseInt(defaultImages.length*Math.random())],
                            projectName: name,
                            projectDescription: description,
                            projectURL: html_url
                        })
                    }).catch((e)=>console.log);
                })(repo);
            }
        } else {
          console.log('Error: ' + xhr.status); // An error occurred during the request.
        }
      }
    };
}
get_repo_list();

