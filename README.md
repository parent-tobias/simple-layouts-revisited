Nested Views with Backbone and Marionette
===============================================

This is the codebase for a revisit of the second post in a series of Backbone tutorials. The first, [http://snowmonkey.parentleafarm.com/blog/2013/02/creating-a-deeply-nested-model-with-backbone-js/] (http://snowmonkey.parentleafarm.com/blog/2013/02/creating-a-deeply-nested-model-with-backbone-js/), dealt with deeply nested models in Backbone. The second, [http://snowmonkey.parentleafarm.com/blog/2013/02/views-with-deeply-nested-models/] (http://snowmonkey.parentleafarm.com/blog/2013/02/views-with-deeply-nested-models/), deals with the views that will be rendered, in keeping with said nested model. This one fixes some problems with the last post, by creating a controller and using Marionette's AppRouter object. By doing this, the fragility that was introduced into the Views is remedied.

The live result can be found here: [http://snowmonkey.parentleafarm.com/nested-layout/] (http://snowmonkey.parentleafarm.com/nested-layout/)

This tutorial will be part of a larger work, taking the process of building a complex, nested, single-page app with Backbone and Marionette. The purposes of this particular step are:

* To examine the roles of Model/View/Controller, and how to avoid crossing them.
* Routing events using Marionette's AppRouter.
* Creating and using a controller.