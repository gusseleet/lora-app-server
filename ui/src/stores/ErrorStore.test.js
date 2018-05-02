import dispatcher from "../config/dispatcher";
import ErrorStore from "./ErrorStore";

jest.dontMock('./ErrorStore');
jest.dontMock('object-assign');

describe('ErrorStore', function() {
  it('should initialize with total of 0 errors', function() {
    var allErrors = ErrorStore.getAll();
    expect(allErrors).toEqual([]);
  });

  it('creates an error', function() {
    ErrorStore.handleActions({type: 'CREATE_ERROR', error: 'foo'})
    var all = ErrorStore.getAll();
    var keys = Object.keys(all);
    expect(keys.length).toBe(1);
    expect(all[keys[0]].error).toEqual('foo');
  });

  it('does not delete an error', function() {
    var all = ErrorStore.getAll();
    var keys = Object.keys(all);
    ErrorStore.handleActions({type: 'DELETE_ERROR', id: 123});
    expect(all).toHaveLength(1);
  });

  it('deletes an error', function() {
    var all = ErrorStore.getAll();
    var keys = Object.keys(all);
    expect(keys.length).toBe(1);
    ErrorStore.handleActions({type: 'DELETE_ERROR', id: all[0].id})
    expect(all).toHaveLength(0);
  });

  it('clears all errors', function() {
    ErrorStore.createError('foo');
    ErrorStore.createError('bar');
    ErrorStore.clear();
    var all = ErrorStore.getAll();
    var keys = Object.keys(all);
    expect(all).toHaveLength(0);
  });

  it('handles empty action type', function() {
    ErrorStore.handleActions({})
    var all = ErrorStore.getAll();
    expect(all).toHaveLength(0);
  });
});