collection @taxon.children, object_root: false 
node(:id) { |taxon| taxon.id }
node(:children ) do  
  @taxon.children.any?
end
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

