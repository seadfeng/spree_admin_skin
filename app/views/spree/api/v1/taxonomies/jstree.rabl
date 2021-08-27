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
node(:seo_url) do |taxon|
  permalink = defined?(SpreeGlobalize) ? @taxonomy.root.translations&.find_by(locale: default_store.default_locale)&.permalink : @taxonomy.root.permalink
  spree.nested_taxons_path(permalink) 
end
node(:admin_url) { 
  spree.edit_admin_taxonomy_taxon_path( @taxonomy, @taxonomy.root.id  ) 
} 
if defined?(SpreeGlobalize)
  node(:translations_url) { 
    spree.admin_translations_path('taxons', @taxonomy.root.id)
  }
end

