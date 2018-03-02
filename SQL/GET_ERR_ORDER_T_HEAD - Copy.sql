select q'<
				 {
             unclickable: true,
             styleClass: _header,
						 columns: [
								 {
										 styleClass: _header,
										 value: 'Execution Date',
										 filter: true,
                     sort: asc
								 },
								 {
										 styleClass: _header,
										 value: 'Suspended',
                     filter: true
								 },
								 {
										 styleClass: _header,
										 value: 'Cancelled'
								 },
								 {
										 styleClass: _header,
										 value: 'Completed'
								 },
								 {
										 styleClass: _header,
										 value: 'Superseded'
								 },
								 {
										 styleClass: _header,
										 value: 'Processing'
								 },
								 {
										 styleClass: _header,
										 value: 'Archived'
								 },
								 {
										 styleClass: _header,
										 value: 'Entering'
								 },
								 {
										 styleClass: _header,
										 value: 'Suspending'
								 },
								 {
										 styleClass: _header,
										 value: 'Total'
								 }
							]
				 }>' as data
from dual