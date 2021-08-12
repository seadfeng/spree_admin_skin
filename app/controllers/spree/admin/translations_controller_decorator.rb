module Spree::Admin::TranslationsControllerDecorator  
    def index
        respond_to do |format|
            format.html { render resource_name, layout: !request.xhr? }
            format.js   { render resource_name, layout: false } if request.xhr?
        end
    end 
end
if defined?(Spree::Admin::TranslationsController)
::Spree::Admin::TranslationsController.prepend(Spree::Admin::TranslationsControllerDecorator )
end