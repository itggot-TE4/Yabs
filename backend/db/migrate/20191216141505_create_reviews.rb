class CreateReviews < ActiveRecord::Migration[6.0]
  def change
    create_table :reviews do |t|
      t.integer :score
      t.string :review

      t.timestamps
    end
  end
end

