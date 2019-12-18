# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

# Import Users
require 'google_books'
ActiveSupport.on_load(:active_job) do
    ActiveJob::Base.queue_adapter = Rails.application.config.active_job.queue_adapter
end
DataFetchJob.perform_now

p_sub = Subject.create(name: "Programming")
s_sub = Subject.create(name: "Swedish")
e_sub = Subject.create(name: "English")
lib_sub = Subject.create(name: "Skönlitteratur")

alice_google = GoogleBooks::API.search('isbn:0763645680').first
# Create titles of both book types
title_alice = Title.create(name: "Alice in Wonderland", isbn: "0763645680", 
    cost: 70, 
    title_type: "Skönlitteratur",
    description: alice_google.description,
    authors: alice_google.authors.to_s,
    cover: alice_google.covers[:large],
    page_count: alice_google.page_count,
    published_date: alice_google.published_date,
    subject: lib_sub
)
title_lotr = Title.create(name: "The Fellowship of the Ring", isbn: "9780547928210", cost: 100, title_type: "Skönlitteratur", subject: lib_sub)

title_cc = Title.create(name: "Clean Code", isbn: "9780132350884", cost: 300, title_type: "Kurslitteratur", subject: p_sub)
title_tomtens_jul = Title.create(name: "Tomtens jul", isbn: "9781999985462", cost: 60, title_type: "Kurslitteratur", subject: s_sub)

# Create books to be loaned
book_alice = Book.create(barcode: "5000", status: "OK", title: title_alice)
book_cc = Book.create(barcode: "1001", status: "OK", title: title_cc)

# Create a loans
loan_alice = Loan.new(expiration_date: Date.current)
loan_alice.lent_by = User.find_by_name("Låneservice Johanneberg")
loan_alice.loaned_by = User.find_by_name("Alex Henryz")
loan_alice.book = book_alice
loan_alice.save

loan_cc = Loan.new(expiration_date: Date.current)
loan_cc.lent_by = User.find_by_name("Låneservice Johanneberg")
loan_cc.loaned_by = User.find(1975529089)
loan_cc.book = book_cc
loan_cc.returned_at = Date.current
loan_cc.save

book_alice.dump_fixture(append=false)
title_alice.dump_fixture(append=false)
title_cc.dump_fixture
title_lotr.dump_fixture
title_tomtens_jul.dump_fixture

review_alice = Review.new(score: 3, review: "I didn't particulary like this book.")
review_alice.title = title_alice
review_alice.user = loan_alice.loaned_by
review_alice.save
review_alice.dump_fixture(append=false)

# Create the rest of the books
Book.create(barcode: "5002", status: "Broken", title: title_alice).dump_fixture
Book.create(barcode: "5003", status: "OK", title: title_alice).dump_fixture
Book.create(barcode: "5004", status: "OK", title: title_lotr).dump_fixture
Book.create(barcode: "5005", status: "Broken", title: title_lotr).dump_fixture
Book.create(barcode: "5006", status: "OK", title: title_cc).dump_fixture
Book.create(barcode: "5007", status: "OK", title: title_tomtens_jul).dump_fixture
Book.create(barcode: "5008", status: "OK", title: title_tomtens_jul).dump_fixture

# Create fixtures
loan_alice.dump_fixture(append=false)
loan_alice.lent_by.dump_fixture(append=false)
loan_alice.loaned_by.dump_fixture(append=true)

loan_cc.dump_fixture
loan_cc.loaned_by.dump_fixture




