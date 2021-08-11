$(function(){   
    var base_url = Spree.url(Spree.routes.taxonomy_taxons_path);
    var $taxonForm = $('#taxon-form');
    var $sidebar = $('#main-sidebar');
    var $mainPart = $('#main-part');
    var $taxonomyTree = $('#taxonomy-tree')

    // Layout
    $mainPart[0].className = "col-12 pl-4 pr-4";
    $sidebar.remove();
    $mainPart.find(" > .container").removeClass();

    var jstree_rename = function( e, data ){  
        console.log(e,data)
        
        var url = base_url.toString();
        var post_data = { }
        var create_node = false;
        if( data.node.original.id == undefined){ // Create a new node
            post_data = {
                'taxon[name]': data.node.text,
                'taxon[parent_id]':  data.node.parent,
                'taxon[child_index]': 0,
                token: Spree.api_key
            }
            create_node = true;
        }else{ //Update node
            post_data = {
                _method: 'put',
                'taxon[name]': data.node.text,
                token: Spree.api_key
            }
            url = data.node.original.url.replace("/jstree","")
        }
        return $.ajax({
            type: 'POST',
            dataType: 'json',
            url: url ,
            data: post_data
        }).done(function (data) {
            // $taxonomyTree.jstree(true).toggle_node(data.node);  
            if(!create_node) $taxonomyTree.jstree(true).refresh(); 
        }).fail(function () {
            data.instance.refresh(); 
        })
    }

    var  jstree_remove = function(e, data) {
        console.log(e,data)   
        if(data.parent !== '#' ){
            var rand = Math.ceil(Math.random()*10);
            var inputText = prompt(`Delete ${data.node.text}, Please enter nomber ${rand}`)
            if ( parseInt(inputText) == rand ) {
                $.ajax({
                  type: 'POST',
                  dataType: 'json',
                  url: data.node.original.url.replace("/jstree","").toString() ,
                  data: {
                    _method: 'delete',
                    token: Spree.api_key
                  }
                }).done(function(){ 
                       $taxonomyTree.jstree(true).toggle_node($('.jstree-icon').first())
                }).fail(function () {
                  data.instance.refresh(); 
                })
            }
        } else{
            data.instance.refresh();  
        }
      }
 
    var jstree_move = function(e, data) { 
         console.log(data)
        $.post({  
            dataType: 'json',
            url: data.node.original.url.replace("/jstree","").toString() , 
            data: {
                _method: 'put',
                'taxon[parent_id]' : data.parent , 
                'taxon[child_index]' : data.position,
                token: Spree.api_key
            },
            success: function(res){ 
                if(data.parent !== data.old_parent) data.instance.refresh();   
            },
            error: function(res) { 
                data.instance.refresh(); 
            }
        })
        return true
    }
    var jstree_changed = function(e, data){ 
         
        if(data && data.selected && data.selected.length && data.node.original.admin_url) { 
            var taxon_url = data.node.original.admin_url   
            $.get({
                type: "get",
                url: taxon_url ,  
                success: function(res){
                    $taxonForm.html(res); 
                    load_ckeditor()  
                },
                error: function(res) {
                    $taxonForm.html("Errors"); 
                }
            }) 
        } else {
             
        }
    } 
    var taxon_tree_menu = function (obj, context) {
        console.log(obj)
        console.log(context)
        return {
          create: {
            label: '<i class="icon icon-add"></i>' + Spree.translations.add,
            action: function (obj) {
              return context.element.create(obj)
            }
          }, 
          remove: {
            label: '<i class="icon icon-delete"></i> ' + Spree.translations.remove,
            action: function (obj) {
              return context.element.remove(obj)
            }
          } 
        }
      }
 
    var setup_taxonomy_tree_v2 = function (taxonomyId) {
        
        if (taxonomyId !== void 0) { 
        
        var core = {
                data: {
                    url: function (node) {   
                        console.log(node)
                        return node.id === '#' ? Spree.url( base_url.path().replace('/taxons', '/jstree'+ '?token=' + Spree.api_key)).toString() : (node.original.url + '?token=' + Spree.api_key) ;
                    },
                    check_callback: true,
                },
                multiple: false,
                force_text: true,
                check_callback: true, 
                strings: {
                    new_node: Spree.translations.new_taxon,
                    loading: Spree.translations.loading + '...'
                }, 
                themes: { 
                    name: 'default', 
                } 
            }
        $taxonomyTree.jstree( { 
                core: core, 
                contextmenu: {
                    // items: function (obj) {
                    //     return taxon_tree_menu(obj, this);
                    // }
                },  
                plugins: ['dnd', 'state',  'contextmenu', 'themes'] 
            }).on('changed.jstree', jstree_changed)
            .on('delete_node.jstree', jstree_remove)
            .on('move_node.jstree',jstree_move)
            // .on('create_node.jstree',jstree_rename) 
            .on('rename_node.jstree', jstree_rename) 
            .bind('loaded.jstree', function () {
                return $(this).jstree(true).show_node($('.jstree-icon').first())
            })
       
        }
    }
    setup_taxonomy_tree_v2(Spree.taxonomy_id);
})



  