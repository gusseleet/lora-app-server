import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Loaded from './Loaded';

Enzyme.configure({ adapter: new Adapter() });

describe('Loaded', () => {
    it('renders without crashing', () => {
        shallow(<Loaded loaded={false} />);
    });

    it('loads object correctly', () => {
        const wrapper = shallow(<Loaded loaded={false} />);
        wrapper.instance().testLoaded({
            name: 'test', 
        });
    });

    it('loads object incorrectly', () => {
        const wrapper = shallow(<Loaded loaded={false} />);
        wrapper.instance().testLoaded({
            name: false,
        });
    });

    it('will recieve props update', () => {
        const wrapper = shallow(<Loaded loaded={false} />);
        wrapper.setProps({
            loaded: true,
        });
    });
});