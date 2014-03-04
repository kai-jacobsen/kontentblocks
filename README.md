# About #

Yet just another builder tool for wordpress ( and not even a very fancy one ).
This one is for developers who:
+ want to touch code to build websites
+ are constrained by project concepts and designs and need to keep control over the outcome and the way it is intended to be used
+ like the idea of reusable building blocks
+ think that widgets and sidebars are kinda insufficient for everything else than a simple blog

It's for developers clients who:
+ just want to manage their content in an intuitive manner, even if they come back 4 weeks later
+ don't care much about our technical magic spells 
+ are no designers and think they paid you for make this internet thing of theirs just work

So it has not a focus on infinite flexibility or on being just a fancy clickydiclick framework for people who can't code. There are other, very good solutions out there and i can't and won't compete with them. 
Kontentblocks is based on my daily work with client projects. I respect the clients and respect that they (more often than not) are not very tech savvy, so things must be as easy as possible. I need to make sure that they can not break things easily, on the other hand. Tough stuff.

### What you get (Short excerpt) ###
Kind of a (buzzzzword-attax) framework to build simple to complex websites with a lot of (unstructured) content eg. randomly placed text, images, galleries...etc. "Unstructured content" sounds limiting, but it's not. You can use the capabilities of this plugin to extend your existing workflow / toolset and just pick the features you need. You're not trapped to use it solely. Basically, a module ( as content elements are named internally ) can be and can do whatever you want it to do. It's up to your creativity and skills.
Expect more explanation to come.

### What you don't get ###
There is some drag 'n drop involved, but don't expect something like Pagelines DNS, Carrington Build etc., a full featured drag n' drop framework to build layouts dynamically, on the fly. Such features will most probably never be integrated, on purpose.
You will need to code your layouts, you're the developer. It's about your decision, not about a lot of options!
That's the difference.

## What you need to know ##
+ It's not ready for production, but you may play with it. (See requirements below)
+ You should have a basic understanding of how wordpress works.
+ Data is stored as serialized arrays on the postmeta table, which is bad, especially when it comes to search.
By now you'll need to rely on some custom search solution if you need to search the content which is handled by the plugin. It's possible to use one of the (costly) commercial search solutions out there, which can handle this kind of data, but support is not build in (yet).
I have (hopefully good) plans to improve this part, but I'm short on time and it's not my highest priority.
If you just need some extra queryable custom fields, you can interact with the saving process, so this is up to you again.
+ I did not have the possibility to test this with a lots of different ( commercial ) themes yet. There is no reason why this shouldn't work with any proper coded theme, but due to the inline editing/frontend editing capabilities and the code involved, it's currently very likely that exisiting theme code may spill into these featurey and lead to errors or at least odd styling. This will get better while I gather more experience with this version or your contributions.

## Requirements ##
+ Tested with PHP 5.3 and developed under PHP 5.5 (Zend Optimizer, APCu, W3 Total Cache)
+ Wordpress 3.9 (nighty build) - this is due to the transition to TinyMCE 4, which is a vital part. Don't even try WP3.8, nasic parts won't work.

## Installation ##
You can clone this repository  or use composer:
Composer repo here:

http://kontentblocks.de/dist/web/
by now "dev-master" is the version of choice.

I'm quite new to this composer thing, don't really know if the setup is correct.
The plugin has a requirement on "Twig" (Template Engine) and it may be necessary (for some unknown reason) to manually update composer:
In that case 'cd' to the plugins directory and do "composer update"
If the update asks you to "discard changes" just say "y". Need help on this setup, if anyone mind to give a hand...

For any updates on dev progress or questions/contact use Twitter: @ungestaltbar
