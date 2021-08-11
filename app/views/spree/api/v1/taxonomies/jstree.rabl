object false
node(:id) { @taxonomy.root.id }
node(:text) { @taxonomy.root.name }
node(:children ) do  
  @taxonomy.root.children.any? 
end
node(:attr) do
  { id: @taxonomy.root.id,
    name: @taxonomy.root.name }
end
node(:state) { 'closed' }
node(:url) { 
  spree.api_v1_taxonomy_taxon_path( @taxonomy, @taxonomy.root.id  ) + '/jstree'
}
node(:admin_url) { 
  spree.edit_admin_taxonomy_taxon_path( @taxonomy, @taxonomy.root.id  ) 
}

