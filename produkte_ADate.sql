alter user 'root' @'localhost' identified with mysql_native_password by 'Preis_24488r';
DELETE FROM products WHERE id=6;
drop table products;
Truncate products;
Truncate members; 
Truncate sessions;
create table members (id int Auto_increment, m_username varchar(255), m_email varchar(50), m_password varchar(255), primary key (id));
create table products (id int Auto_increment, m_id int, p_image blob, p_name varchar(100), p_quantity int, p_expirydate varchar(10), primary key (id));
use produkte_adate;

select * from products;
select * from members;
select * from sessions;



