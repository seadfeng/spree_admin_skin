$(function(){   
    var base_url = Spree.url(Spree.routes.taxonomy_taxons_path);
    var $taxonForm = $('#taxon-form');
    var $sidebar = $('#main-sidebar');
    var $mainPart = $('#main-part');
    var $taxonomyTree = $('#taxonomy-tree');
    var $taxonTranslations = $('#taxon-translations');
    

    // Layout
    $mainPart[0].className = "col-12 pl-4 pr-4";
    $sidebar.remove();
    $mainPart.find(" > .container").removeClass();  
    $mainPart.find(".content-header > div").append('<div class="page-actions pl-0 pr-0 d-none d-lg-flex" data-hook="toolbar"></div>');
    var $pageActions = $mainPart.find(".page-actions"); 

    var jstree_rename = function( e, data ){   

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
            if(create_node) $taxonomyTree.jstree(true).refresh(); 
        }).fail(function () {
            data.instance.refresh(); 
        })
    }

    var  jstree_remove = function(e, data) {
         
        if(data.parent !== '#' ){  
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: data.node.original.url.replace("/jstree","").toString() ,
                data: {
                _method: 'delete',
                token: Spree.api_key
                }
            }).done(function(){ 
                $taxonomyTree.jstree(true).select_node($('.jstree-icon').first());
                data.instance.refresh();  
            }).fail(function () {
                data.instance.refresh(); 
            }) 
        } else{
            data.instance.refresh();  
        }
      }
 
    var jstree_move = function(e, data) { 
          
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
            var taxon_url = data.node.original.admin_url; 
            if(Spree.switch_edit != null && Spree.switch_edit == "translations"){ 
                taxon_url = data.node.original.translations_url; 
            }
            var actions =   `<div class="btn-actions">${preview_btn(data.node)}${switch_btn(data.node, Spree.switch_edit)}</div>`;
            $.get({
                type: "get",
                url: taxon_url ,  
                success: function(res){ 
                    $pageActions.html(actions);
                    $taxonForm.html(res); 
                    load_ckeditor();
                    if(Spree.switch_edit != null) initTranslations(); 
                    
                    // Initiate a standard Select2 on any select element with the class .select2
                    // Remember to add a place holder in the HTML as needed.
                    $('select.select2').select2({})
                    
                    // Initiate a Select2 with the option to clear, on any select element with the class .select2-clear
                    // Set: include_blank: true in the ERB.
                    // A placeholder is auto-added here as it is required to clear the Select2.
                    $('select.select2-clear').select2({
                        placeholder: Spree.translations.select_an_option,
                        allowClear: true
                    }) 
                },
                error: function(res) {
                    $taxonForm.html("Errors"); 
                }
            }) 
        } else {
             
        }
    } 
    var taxon_tree_menu = function ($node, context) { 
        
        return {
          create: {
            label: '<i class="icon icon-add"></i> ' + Spree.translations.add,
            action: function (item) { 
              new_node =  context.create_node($node) ; 
              return  context.edit(new_node);
            }
          }, 
          remove: {
            label: '<i class="icon icon-delete"></i> ' + Spree.translations.remove,
            action: function (item) { 
                
                var rand = Math.ceil(Math.random()*10);
                var inputText = prompt(`Delete ${$node.text}, Please enter nomber ${rand}`)
                if ( parseInt(inputText) == rand   ) {
                    return context.delete_node($node);
                }  
            },
            _disabled: function(item) { 
                console.log(item.element)
                console.log($node)
                if (  $node.parent == '#' || !$node.original.can_remove  ) {
                    return true;
                }  
            }
          }, 
        //   rename: {
        //     label: '<i class="icon icon-rename"></i> ' + Spree.translations.rename,
        //     action: function (item) {
        //       return context.edit($node)
        //     }
        //   }  
        }
      }

    var switch_btn = function( $node , param = "translations" ){
        if(param == "taxon") return translations_btn($node);
        if(param == "translations") return taxon_btn($node);
        return '';
    }
    var preview_btn = function( $node ){
        return `
        <a class="btn btn-outline-secondary" id="admin_preview_taxon" target="blank" href="${$node.original.seo_url}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" class="icon-view icon icon-view.svg" width="16px" height="16px">
                <path fill="currentColor" d="M256 192c0 35.328-28.672 64-64 64 0 35.328 28.672 64 64 64s64-28.672 64-64-28.672-64-64-64zm0-128C124.736 64 0 212.736 0 256c0 43.264 124.736 192 256 192s256-148.736 256-192c0-43.264-124.736-192-256-192zm0 320c-70.688 0-128-57.312-128-128s57.312-128 128-128 128 57.312 128 128-57.312 128-128 128z" fill-rule="nonzero"></path>
            </svg>
        ${ Spree.translations.preview_taxon }
        </a>
        `
    }
    var taxon_btn = function( $node ){
        return `
        <a class="btn btn-primary" id="admin_edit_taxon" href="?type=taxon">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16px" height="16px" viewBox="0 0 512 512" version="1.1" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" class="icon-edit mr-2 icon icon-edit.svg">
            <g transform="matrix(18.3151,0,0,-18.3533,-16.8313,533.62)" fill="currentColor">
            <path d="M2,3.002C1.715,3 1.442,3.121 1.251,3.333C1.06,3.545 0.969,3.829 1,4.112L1.77,11.112C1.797,11.336 1.9,11.544 2.06,11.702L18.42,28.062C19.02,28.664 19.835,29.002 20.685,29.002C21.535,29.002 22.35,28.664 22.95,28.062L26.06,24.952C26.662,24.352 27,23.537 27,22.687C27,21.837 26.662,21.023 26.06,20.422L9.71,4.072C9.552,3.912 9.344,3.81 9.12,3.782L2.12,3.012L2,3.002ZM3.73,10.552L3.13,5.132L8.55,5.732L24.65,21.832C24.876,22.057 25.003,22.363 25.003,22.682C25.003,23.001 24.876,23.307 24.65,23.532L21.53,26.652C21.305,26.878 20.999,27.005 20.68,27.005C20.361,27.005 20.055,26.878 19.83,26.652L3.73,10.552Z" style="fill-rule:nonzero;"></path>
            </g>
            <g transform="matrix(18.3151,0,0,-18.3533,-16.8313,315.135)" fill="currentColor">
            <path d="M23,5.888C22.734,5.886 22.479,5.991 22.29,6.178L16.08,12.408C15.691,12.8 15.692,13.434 16.083,13.825C16.474,14.216 17.107,14.217 17.5,13.828L23.73,7.598C23.919,7.41 24.026,7.154 24.026,6.888C24.026,6.621 23.919,6.366 23.73,6.178C23.536,5.986 23.273,5.881 23,5.888Z" style="fill-rule:nonzero;"></path>
            </g>
            <g transform="matrix(12.9508,-12.9778,-12.9508,-12.9778,273.886,649.445)" fill="currentColor">
            <rect x="7.39" y="16.1" width="11.01" height="2"></rect>
            </g>
            <g transform="matrix(17.7456,2.1377e-16,-2.1377e-16,-16,-40.1047,943)" fill="currentColor">
            <path d="M30,27L14.188,27C13.637,27.002 13.192,27.449 13.192,28C13.192,28.551 13.637,28.998 14.188,29L30,29C30.551,28.998 30.996,28.551 30.996,28C30.996,27.449 30.551,27.002 30,27Z" style="fill-rule:nonzero;"></path>
            </g>
        </svg>
        ${ Spree.translations.taxon }
        </a>
        `
    }
    var translations_btn = function( $node ){
        // if($node.original.translations_url == undefined || $node.original.translations_url == null) return '';
        return  `
        <a class="btn btn-primary icon-link with-tip action-translate" href="?type=translations" data-original-title="" title=""><span class="mr-2 icon icon-translate"></span> <span class="text"><span>${ Spree.translations.translations }</span></span></a>
        `
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
                    items: function (obj) {
                        return taxon_tree_menu(obj, this);
                    }
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



  