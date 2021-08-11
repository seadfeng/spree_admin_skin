module SpreeAdminSkin
  module Generators
    class InstallGenerator < Rails::Generators::Base
      class_option :migrate, type: :boolean, default: true

      def add_javascripts
        append_file "vendor/assets/javascripts/spree/backend/all.js", "//= require spree/backend/spree_admin_skin\n"
			end

      def install_js_packages 
        run "yarn add jstree" 
      end 

    end
  end
end
