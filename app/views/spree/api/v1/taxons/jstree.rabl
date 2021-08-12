collection @taxon.children, object_root: false 
node(:id) { |taxon| taxon.id }
node(:children ) do |taxon|
   taxon.children.map{ |item| { 
        id: item.id, 
        text: item.name, 
        children: item.children.any?,
        can_remove: !item.children.any?,
        state: 'closed' , 
        attr: { id: item.id, name: item.name } , 
        url:  spree.api_v1_taxonomy_taxon_path(item.taxonomy, item.id ) + "/jstree" , 
        admin_url:  spree.edit_admin_taxonomy_taxon_path(item.taxonomy, item.id )  , 
      }
    } 
end
node(:can_remove)  { |taxon| !taxon.children.any? } 
node(:text, &:name)
node(:attr) do |taxon|
  { id: taxon.id,
    name: taxon.name }
end
node(:state) { 'closed' }
node(:url) do |taxon|
  spree.api_v1_taxonomy_taxon_path(taxon.taxonomy, taxon.id ) + "/jstree" 
end
node(:admin_url) do |taxon|
  spree.edit_admin_taxonomy_taxon_path( taxon.taxonomy, taxon.id  ) 
end

