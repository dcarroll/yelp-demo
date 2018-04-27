import { Element, api } from 'engine';

export default class ProductCard extends Element {
    @api Name = 'Tricycle';
    @api Description = 'A bike designed for beginners, perfect for first time riders.';
    @api Gender = 'All';
    @api Category = 'Three wheelers';
    @api Materical = 'Steel';
    @api Price = '123';
    @api PictureUrl = 'https://s3-us-west-1.amazonaws.com/sfdc-demo/bikes/tricycle.jpg';
}
