'use strict'

var $ = require('jquery')
var yo = require('yo-yo')

function getOptions () {
  var data = {}
  $('#oyente-options input').each( function () {
    var attr = $(this).attr('name')
    var val = $(this).val()
    if (val) {
      data[attr] = val
    }
  })
  return data
}

function Analyzer () {

  this.analyze = function (filename, source) {
    var data = getOptions()
    data['source'] = source
    data['filename'] = filename

    var loading = yo`
      <span>
        <i class="fa fa-cog fa-spin fa-fw">  </i>
        Analyzing ...
      </span>
    `
    $('#analyzer').html(loading).css('pointer-events', 'none')
    $('#analysis').empty().hide()

    var finish = yo`
      <span>
        <i class="fa fa-search" aria-hidden="true">  </i>
        Analyze
      </span>
    `

    $.ajax({
      type: 'POST',
      url: 'home/analyze',
      data: { 'data': data },
      dataType: 'json',
      error: function(jqXHR, exception) {
        var error = yo`<div>
          Some errors occured. Please try again!
        </div>`
        $('#analysis').append(error)
        $('#analyzer').html(finish).css('pointer-events', 'auto')
        $('#analysis').fadeIn()
      },
      success: function (response) {
        var data = response.results
        var filename = data.filename

        if (data.hasOwnProperty("error")) {
          var results = yo`<div>
            <div>${filename}</div>
            <br />
            <div>${data.error}</div>
          </div>`
        } else {
          var contracts = data.contracts
          var bug_exists = function(msg) {
            if (msg) {
              return $.parseHTML("<span style='color: red'>True</span>")
            } else{
              return $.parseHTML("<span style='color: green'>False</span>")
            }
          }
          var results = yo`<div>
            <div>${filename}</div>
            <br />
            ${contracts.map(function (contract) {
              if (contract.evm_code_coverage === "0/0") {
                return yo`<div>
                  <div>======= contract ${contract.cname} =======</div>
                  <div>EVM code coverage: ${contract.evm_code_coverage}</div>
                  <div>Callstack bug: ${bug_exists(contract.callstack)}</div>
                  <div>Money concurrency bug: ${bug_exists(contract.concurrency)}</div>
                  <div>Time dependency bug: ${bug_exists(contract.time_dependency)}</div>
                  <div>Reentrancy bug: ${bug_exists(contract.reentrancy)}</div>
                  <div>Assertion failure: ${bug_exists(contract.assertion_failure)}</div>
                  <div>======= Analysis Completed =======</div>
                  <br />
                </div>`
              } else {
                return yo`<div>
                  <div>======= contract ${contract.cname} =======</div>
                  <div>EVM code coverage: ${contract.evm_code_coverage}%</div>
                  <div>Callstack bug: ${bug_exists(contract.callstack)}</div>
                  <div>Money concurrency bug: ${bug_exists(contract.concurrency)}</div>
                  <div>Time dependency bug: ${bug_exists(contract.time_dependency)}</div>
                  <div>Reentrancy bug: ${bug_exists(contract.reentrancy)}</div>
                  <div>Assertion failure: ${bug_exists(contract.assertion_failure)}</div>
                  ${
                    (contract.callstack || contract.concurrency || contract.time_dependency
                      || contract.reentrancy || contract.assertion_failure) ? $.parseHTML("<br />") : ""
                  }
                  <div>${$.parseHTML(contract.callstack)}</div>
                  <div>${$.parseHTML(contract.concurrency)}</div>
                  <div>${$.parseHTML(contract.time_dependency)}</div>
                  <div>${$.parseHTML(contract.reentrancy)}</div>
                  <div>${$.parseHTML(contract.assertion_failure)}</div>
                  <div>======= Analysis Completed =======</div>
                  <br />
                </div>`
              }
            })}
          </div>`
        }

        $('#analysis').append(results)
        $('#analyzer').html(finish).css('pointer-events', 'auto')
        $('#analysis').fadeIn()
      }
    })
  }
}

module.exports = Analyzer
