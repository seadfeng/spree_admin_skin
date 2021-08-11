module Spree::Admin::TaxonsControllerDecorator  
    def edit
        respond_with(@object) do |format|
            format.html { render layout: !request.xhr? }
            format.js   { render layout: false } if request.xhr?
        end
    end 
end
::Spree::Admin::TaxonsController.prepend(Spree::Admin::TaxonsControllerDecorator )