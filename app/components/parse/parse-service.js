function ParseService() {
    Parse.initialize("ZJuxK6cPbOs5u3hy78QuIIojsBLnrDgpPeY9EQNU", "Rncx0sNYiCARajhzNE2m86l4HXdmYxo3yZ2AGJNy");
}

angular.module("parse.service", ['parse-angular'])
	.run([ParseService]);